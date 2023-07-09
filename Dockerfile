FROM --platform=linux/amd64 ubuntu:20.04 as image_name

WORKDIR /unity

# Need to build with UnityEditor in advance.
COPY build/StandaloneLinux64/ ./
COPY server/start.sh ./

RUN rm -rf StandaloneLinux64_BackUpThisFolder_ButDontShipItWithYourGame

RUN touch output.log
# CMD ./luau.x86_64 -batchmode -nographics -logfile output.log & tail -f output.log
ENTRYPOINT ["/bin/bash", "./start.sh"]