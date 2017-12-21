set -e


STRATEGY=$1
if [[ $STRATEGY == "" ]]; then
  STRATEGY = "staging"
fi

echo "Deploying revision: $(git rev-parse master) $(date)"

ansible-playbook deploy.yml -i ./AWSInventory.js --extra-vars=@"$STRATEGY-"settings.json -v
