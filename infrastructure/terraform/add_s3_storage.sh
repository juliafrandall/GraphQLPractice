
#!/bin/bash
KEY_NAME=NewSiteDesign


terraform remote config \
    -backend=s3 \
    -backend-config="bucket=nix-terraform" \
    -backend-config="key=$KEY_NAME/terraform.tfstate" \
    -backend-config="region=us-east-1"
