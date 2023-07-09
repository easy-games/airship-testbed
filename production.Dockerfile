FROM --platform=linux/amd64 ubuntu:20.04 as image_name

WORKDIR /unity

# Need to build with UnityEditor in advance.
COPY build/StandaloneLinux64/ ./

RUN rm -rf ./StandaloneLinux64_Data/StreamingAssets/local/client
RUN rm -rf StandaloneLinux64_BackUpThisFolder_ButDontShipItWithYourGame

RUN apt update
RUN apt install -y --reinstall ca-certificates

# [Workaround] Wait until the sidecar is ready.
CMD sleep 2 && ./StandaloneLinux64 -batchmode -nographics -profilerport 55000