#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

IMAGE_NAME="eraseable-chat-app"
DEV_CONTAINER="eraseable-chat-app-dev"
PROD_CONTAINER="eraseable-chat-app-prod"
DEFAULT_CERT_PASSWORD="a234sdfjyttgfh4sSS"

usage() {
  cat <<'EOF'
Usage:
  install.sh dev [--no-build] [--host-port PORT]
  install.sh prod --cert-path /path/to/keystore.p12 [--cert-password PASSWORD] [--host-port PORT] [--no-build]

Options:
  --no-build           Skip docker build if the image already exists.
  --host-port PORT     Host port to bind (default 8080 for dev, 443 for prod).
  --cert-path PATH     Absolute or relative path to the TLS PKCS12 keystore (prod only, required).
  --cert-password PWD  Password for the PKCS12 keystore (defaults to application-prod.properties value).

The script builds the Docker image and runs the container with the correct Spring profile.
Dev mode exposes HTTP, prod mode exposes HTTPS and mounts your keystore as /certs/keystore.p12.
EOF
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: Docker is not installed or not in PATH." >&2
    exit 1
  fi
}

build_image() {
  local skip_build="$1"
  if [[ "${skip_build}" == "true" ]]; then
    if docker image inspect "${IMAGE_NAME}" >/dev/null 2>&1; then
      echo "Skipping image build because ${IMAGE_NAME} already exists."
      return
    fi
    echo "Image ${IMAGE_NAME} not found; building anyway."
  fi
  DOCKER_BUILDKIT=1 docker build --pull -t "${IMAGE_NAME}" "${PROJECT_ROOT}"
}

remove_container_if_present() {
  local name="$1"
  local existing_id
  existing_id="$(docker ps -aq --filter "name=^${name}$")"
  if [[ -n "${existing_id}" ]]; then
    local running_id
    running_id="$(docker ps -q --filter "name=^${name}$")"
    if [[ -n "${running_id}" ]]; then
      echo "Stopping running container ${name}..."
      docker stop "${name}" >/dev/null
    fi
    echo "Removing container ${name}..."
    docker rm "${name}" >/dev/null
  fi
}

run_dev() {
  local host_port="$1"
  remove_container_if_present "${DEV_CONTAINER}"
  echo "Starting dev container on host port ${host_port}..."
  docker run -d \
    --name "${DEV_CONTAINER}" \
    --restart unless-stopped \
    -p "${host_port}:8080" \
    -e SPRING_PROFILES_ACTIVE=dev \
    -e SERVER_PORT=8080 \
    "${IMAGE_NAME}"
  docker ps --filter "name=${DEV_CONTAINER}"
}

resolve_path() {
  local input="$1"
  if [[ "${input}" == /* ]]; then
    printf '%s\n' "${input}"
  else
    printf '%s\n' "$(cd "${PWD}" && cd "$(dirname "${input}")" && pwd)/$(basename "${input}")"
  fi
}

run_prod() {
  local host_port="$1"
  local cert_path_raw="$2"
  local cert_password="$3"

  if [[ -z "${cert_path_raw}" ]]; then
    echo "ERROR: --cert-path is required for prod installs." >&2
    usage
    exit 1
  fi

  local cert_path
  cert_path="$(resolve_path "${cert_path_raw}")"

  if [[ ! -f "${cert_path}" ]]; then
    echo "ERROR: Could not find keystore at ${cert_path}" >&2
    exit 1
  fi

  remove_container_if_present "${PROD_CONTAINER}"

  echo "Starting prod container on host port ${host_port} with keystore ${cert_path}..."
  docker run -d \
    --name "${PROD_CONTAINER}" \
    --restart unless-stopped \
    -p "${host_port}:8443" \
    -e SPRING_PROFILES_ACTIVE=prod \
    -e SERVER_PORT=8443 \
    -e SERVER_SSL_ENABLED=true \
    -e SERVER_SSL_KEY_STORE=/certs/keystore.p12 \
    -e SERVER_SSL_KEY_STORE_PASSWORD="${cert_password}" \
    -e SERVER_SSL_KEY_STORE_TYPE=PKCS12 \
    -e SERVER_SSL_KEY_ALIAS=tomcat \
    -v "${cert_path}:/certs/keystore.p12:ro" \
    "${IMAGE_NAME}"
  docker ps --filter "name=${PROD_CONTAINER}"
}

main() {
  if [[ $# -lt 1 ]]; then
    usage
    exit 1
  fi
  local mode="$1"
  shift

  case "${mode}" in
    dev|prod) ;;
    *)
      echo "ERROR: Mode must be 'dev' or 'prod'." >&2
      usage
      exit 1
      ;;
  esac

  ensure_docker

  local host_port skip_build cert_path cert_password
  skip_build="false"
  cert_path=""
  cert_password="${DEFAULT_CERT_PASSWORD}"
  if [[ "${mode}" == "dev" ]]; then
    host_port="8080"
  else
    host_port="443"
  fi

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --no-build)
        skip_build="true"
        shift
        ;;
      --host-port)
        if [[ -z "${2:-}" ]]; then
          echo "ERROR: --host-port requires a value." >&2
          exit 1
        fi
        host_port="$2"
        shift 2
        ;;
      --cert-path)
        if [[ -z "${2:-}" ]]; then
          echo "ERROR: --cert-path requires a value." >&2
          exit 1
        fi
        cert_path="$2"
        shift 2
        ;;
      --cert-password)
        if [[ -z "${2:-}" ]]; then
          echo "ERROR: --cert-password requires a value." >&2
          exit 1
        fi
        cert_password="$2"
        shift 2
        ;;
      -*)
        echo "ERROR: Unknown option $1" >&2
        usage
        exit 1
        ;;
      *)
        echo "ERROR: Unexpected argument $1" >&2
        usage
        exit 1
        ;;
    esac
  done

  if [[ "${mode}" == "prod" && -z "${cert_path}" ]]; then
    echo "ERROR: --cert-path is required in prod mode." >&2
    usage
    exit 1
  fi

  build_image "${skip_build}"

  if [[ "${mode}" == "dev" ]]; then
    run_dev "${host_port}"
  else
    run_prod "${host_port}" "${cert_path}" "${cert_password}"
  fi
}

main "$@"
