<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@page import="java.io.FileOutputStream" %>
<%@page import="java.io.OutputStream" %>
<%@page import="java.io.InputStream" %>
<%@page import="java.util.UUID" %>
<%@page import="java.text.SimpleDateFormat" %>
<%@page import="java.io.File" %>
<%@page import="jakarta.servlet.http.Part" %>
<%@page import="java.util.Collection" %>

<%
String return1 = "";
String return2 = "";
String return3 = "";
String name = "";

if (request.getContentType() != null && request.getContentType().startsWith("multipart/form-data")) {
    Collection<Part> parts = request.getParts();

    for (Part part : parts) {
        String fieldName = part.getName();

        if (fieldName.equals("callback")) {
            return1 = request.getParameter("callback");
        } else if (fieldName.equals("callback_func")) {
            return2 = "?callback_func=" + request.getParameter("callback_func");
        } else if (fieldName.equals("Filedata")) {
            if (part.getSize() > 0) {

                name = part.getSubmittedFileName();
                if (name != null) {
                    name = name.substring(name.lastIndexOf(File.separator) + 1);
                    String filename_ext = name.substring(name.lastIndexOf(".") + 1).toLowerCase();
                    String[] allow_file = {"jpg", "png", "bmp", "gif"};
                    boolean isValidFile = false;

                    for (String ext : allow_file) {
                        if (filename_ext.equals(ext)) {
                            isValidFile = true;
                            break;
                        }
                    }

                    if (!isValidFile) {
                        return3 = "&errstr=" + name;
                    } else {
                        // File save directory
                        String dftFilePath = request.getServletContext().getRealPath("/upload");
                        String filePath = dftFilePath + File.separator;

                        File file = new File(filePath);
                        if (!file.exists()) {
                            file.mkdirs();
                        }

                        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                        String today = formatter.format(new java.util.Date());
                        String realFileNm = today + UUID.randomUUID().toString() + name.substring(name.lastIndexOf("."));

                        String rlFileNm = filePath + realFileNm;

                        // Write file to server
                        try (InputStream is = part.getInputStream();
                             OutputStream os = new FileOutputStream(rlFileNm)) {

                            byte[] buffer = new byte[1024];
                            int bytesRead;
                            while ((bytesRead = is.read(buffer)) != -1) {
                                os.write(buffer, 0, bytesRead);
                            }

                            String contextPath = request.getContextPath();
                            return3 += "&bNewLine=true";
                            return3 += "&sFileName=" + name;
                            return3 += "&sFileURL=" + contextPath + "/upload/" + realFileNm;
                        }
                    }
                }
            } else {
                return3 += "&errstr=error";
            }
        }
    }
}
response.sendRedirect(return1 + return2 + return3);
%>
