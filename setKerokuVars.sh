#!/bin/sh

envFile=./.env.prod
numOfLine=$(cat $envFile | wc -l)

cmd="heroku config:set"
configStr=""

for ((i=1; i<=$numOfLine; i++))
do
	line=$(head -n $i $envFile | tail -1)
	# Parsing key value pair
	# key=$(echo $line | grep -o "^[^=]*=")
	# key=${key:0:${#key}-1}
	# value=$(echo $line | grep -o "=.*$")
	# value=${value:1}
	configStr="$configStr $line"
done

cmd="$cmd $configStr"

echo $cmd

echo "[*] set heroku config vars with above cmd? [y,n] \c"
	read res
	case $res in
		y|Y|yes) $cmd ;;
		*) ;;
	esac

