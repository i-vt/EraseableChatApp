package com.example.chatapp.config;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@WebFilter("/*")
public class UploadSizeFilter implements Filter {

    private static final long MAX_SIZE = 150L * 1024 * 1024; // 50MB

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest req && response instanceof HttpServletResponse res) {
            String contentLengthHeader = req.getHeader("Content-Length");

            if (contentLengthHeader != null) {
                try {
                    long size = Long.parseLong(contentLengthHeader);
                    if (size > MAX_SIZE) {
                        res.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
                        res.getWriter().write("File too large. Maximum allowed size is 150MB.");
                        return;
                    }
                } catch (NumberFormatException ignored) {
                    // if header is malformed, let Spring handle it
                }
            }
        }

        chain.doFilter(request, response);
    }
}
