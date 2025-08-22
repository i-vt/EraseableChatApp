package com.example.chatapp.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/emojis")
public class EmojiController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "gif");

    @GetMapping
    public List<String> listEmojis() throws IOException, URISyntaxException {
        Path emojiDir;
        try {
            emojiDir = Paths.get(new ClassPathResource("static/images/emojis").getURI());
        } catch (FileSystemNotFoundException | FileSystemAlreadyExistsException e) {
            // Handle running from inside a JAR
            FileSystem fs = FileSystems.newFileSystem(
                new ClassPathResource("static/images/emojis").getURI(), Collections.emptyMap()
            );
            emojiDir = fs.getPath("/static/images/emojis");
        }

        try (Stream<Path> stream = Files.walk(emojiDir, 1)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(path -> {
                        String filename = path.getFileName().toString().toLowerCase();
                        int dot = filename.lastIndexOf('.');
                        return dot != -1 && ALLOWED_EXTENSIONS.contains(filename.substring(dot + 1));
                    })
                    .map(path -> "/images/emojis/" + path.getFileName())
                    .collect(Collectors.toList());
        }
    }
}
