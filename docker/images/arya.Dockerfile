FROM node:8

ENV PATH=$PATH:/usr/bin/:/usr/local/bin/
ENV DISPLAY=:1

# Copy browser scripts
COPY bin/install-chrome /temp/
RUN chmod +x /temp/* \
    && sed -i -e 's/\r$//' /temp/* \
    && cp -r /temp/* /usr/bin/ \
    && rm -r /temp/

# Install browsers
RUN /usr/bin/install-chrome

# Build runner source code
COPY package.json /app/
WORKDIR /app/
RUN npm install

COPY tsconfig.json tsconfig.build.json /app/
COPY src/ /app/src/
RUN npm run build

# Copy remaining scripts
COPY bin/ /temp/
RUN chmod +x /temp/* \
    && sed -i -e 's/\r$//' /temp/* \
    && cp -r /temp/* /usr/bin/ \
    && rm -r /temp/

ENTRYPOINT xvfb-run npm start