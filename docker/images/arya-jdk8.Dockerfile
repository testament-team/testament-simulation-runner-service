FROM jlazarre95/arya-runner
ENV JAVA_VERSION 8
ENV GRADLE_VERSION 6.0.1

RUN install-java ${JAVA_VERSION}
ENV JAVA_HOME /usr/lib/jvm/java-${JAVA_VERSION}-openjdk-amd64/
RUN export JAVA_HOME

RUN install-gradle ${GRADLE_VERSION}
ENV GRADLE_HOME /usr/local/gradle-${GRADLE_VERSION}
ENV PATH ${PATH}:${GRADLE_HOME}/bin
RUN gradle