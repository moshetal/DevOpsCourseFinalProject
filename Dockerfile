# Free-hosting image for Render. Serves index.jsp as the ROOT app so the
# public URL is the bare domain (clean for monitoring).
FROM tomcat:10.1-jdk21-temurin

# Replace the default ROOT app with our JSP.
RUN rm -rf /usr/local/tomcat/webapps/ROOT
RUN mkdir -p /usr/local/tomcat/webapps/ROOT
COPY index.jsp /usr/local/tomcat/webapps/ROOT/index.jsp

EXPOSE 8080
CMD ["catalina.sh", "run"]
