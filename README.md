# Testment Runner

The Testment Runner is a component that is responsible for executing Testment simulations.

## Quick Start

To run the Runner, execute the following commands:

```
npm install
npm build
npm start
```

### Hot Reload

For hot reload functionality, execute the following commands instead:

```
npm install
npm run start:dev
```

## Environment

.env

```
S3_ENDPOINT=<s3-endpoint>
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
```

test/.env

```
S3_ENDPOINT=<s3-endpoint>
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
```

## Sample RabbitMQ Message

run.simulation.start.queue:

```json
{
    "runId": "1234",
    "type": "java_chromium",
    "repository": {
        "type": "git",
        "git": {
            "url": "https://github.com/testment-team/testment-core-java",
        }
    },
    "args": "--simulation search --url https://www.google.com --query cats --browser chrome --auto-screenshots --auto-wait 2 --embedded-proxy --local-driver --headless --log-level=ERROR",
    "runCommands": [
        "gradle build -x test",
        "java -jar build/libs/testment-core-0.0.1.jar ${args}"
    ]
}
```

## How It Works

The Testment Runner is a REST service implemented in NestJS 
and exposes APIs for executing a simulation, querying its 
status, and retrieving its various artifacts.

The Testment Runner need not know the underlying 
implmentation of the Testment simulation in order to run it. 
The simulation can be Java/Selenium, Node.JS/Puppeteer, or 
whatever combination. 

The Runner is fed a repository URL for 
fetching the simulation source code and an ordered list of executable CLI commands to run the simulation. For all available APIs, please visit the Swagger documentation.

Typically, Runners are created when they are needed (i.e., to run a simulation) by the Testment Dispatcher and torn down as
soon as they are not needed anymore (simulation fails or passes) to provide a short-lived isolated environment for each simulation.

### Artifacts

The simulation is expected to store various artifacts
to a predefined set of locations on-disk, so that the Runner 
can collect and expose them via its own REST APIs. Upstream 
services are then expected to call them later on to retrieve
said artifacts. 

Typically, you don't have to worry about creating or storing these artifacts as this is covered by the Testment Core Framework that your simulation imports as a dependency.

Pre-defined Artifact Paths:

* Simulation Directory Path: `<simulation-path>`
* Temp Directory Path: `<simulation-path>/tmp`
* Har File Path: `<simulation-path>/tmp/recording.har`
* Actions File Path: `<simulation-path>/tmp/actions.json`
* Screenshots Directory Path: `<simulation-path>/tmp/screenshots`

### Logging

Any output printed to standard output and standard error by your simulation will be captured by the Runner as a special kind of artifact and stored in a simple plain text file. This file is also accessible via the Runner's API just as any other artifact.

Although you can use simple `System.out.println()` and `console.log()` commands, it is recommended to use the provided Testment logger for printing output and it will included niceties such as timestamp, ANSI color-coding, and logging levels and labels for each log message.

### Docker Images

In order to support different simulation implementations (e.g., Java, Node.JS), the Runner will have 
multiple pre-published Docker Images with specific 
depenedencies installed. For example, `testment/runner:jdk8` 
has JDK 8, Gradle, and Maven installed for building and 
running Java 8 simulations.