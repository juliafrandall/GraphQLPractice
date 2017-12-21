set -e
HOSTNAME=$1
echo $1 $HOSTNAME
echo "127.0.0.1 $HOSTNAME" >> /etc/hosts
echo "$HOSTNAME" > /etc/hostname
service hostname restart
