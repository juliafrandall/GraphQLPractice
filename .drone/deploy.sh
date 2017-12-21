set -e


STRATEGY=$1
if [[ $STRATEGY == "production" ]] || [[ $STRATEGY == "staging" ]]
  then
    echo "deploying strategy $1"
  else
    echo "Must choose production || staging"
    exit 1
fi

# echo "updating apt"
# sudo apt-get update
# echo "installing software-properties-common"
# sudo apt-get install software-properties-common
# echo "adding ansible package info"
# sudo apt-add-repository ppa:ansible/ansible
# echo "updating apt again"
# sudo apt-get update
# echo "getting ansible"
# sudo apt-get install ansible
echo "switching directories"
cd ../infrastructure/ansible
echo "Updating dependencies for ansible script"
npm install
./init.sh $STRATEGY
echo "Queueing mainsite ironworker test & exiting"

if [[ $STRATEGY == "production" ]]; then
  curl -H “Content-Type: application/json” -H “Authorization: OAuth Q-Q5FXJtZ5hanpTUJtbwchj51tk” -X POST -d ‘{“tasks”: [{“code_name”: “nix-live-test”,“payload”: “{\“origin\“: \“Drone\“}”,“cluster”: “nutritionix”, “timeout”: 900, “delay”: 300}]}’ https://worker-aws-us-east-1.iron.io/2/projects/5425885f38ef2d000700008b/tasks
fi
