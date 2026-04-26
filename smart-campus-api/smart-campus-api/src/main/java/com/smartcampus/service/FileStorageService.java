package com.smartcampus.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
@Service
public class FileStorageService {
private static final List<String> ALLOWED =
List.of("image/jpeg","image/png","image/jpg");
private static final int MAX_FILES = 3;
@Value("${app.upload.dir:uploads/}")
private String uploadDir;
public List<String> saveFiles(
List<MultipartFile> files) throws IOException {
if (files == null || files.isEmpty())
return Collections.emptyList();
if (files.size() > MAX_FILES)
throw new IllegalArgumentException(
"Maximum " + MAX_FILES + " attachments allowed");
        // Ensure upload directory exists
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        List<String> paths = new ArrayList<>();
        for (MultipartFile file : files) {
            String ct = file.getContentType();
            if (ct == null || !ALLOWED.contains(ct))
                throw new IllegalArgumentException(
                    "Only JPEG and PNG images allowed");
                        String ext = ct.equals("image/png") ? ".png" : ".jpg";
            String name = UUID.randomUUID() + ext;
            Path dest = dir.resolve(name);
            Files.copy(file.getInputStream(), dest,
                StandardCopyOption.REPLACE_EXISTING);
            paths.add(uploadDir + name);
        }
                return paths;
    }

    public void deleteFile(String filePath) {
        try { Files.deleteIfExists(Paths.get(filePath)); }
        catch (IOException ignored) {}
    }
}
