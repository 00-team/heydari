SPACER="============================================================================================"
EG="🔷"

cd /site/heydari/
source .env/bin/activate

OLD_COMMIT=$(git rev-parse HEAD)

echo "$EG update the source"
git pull
echo $SPACER

NEW_COMMIT=$(git rev-parse HEAD)

function check_diff {
    local file_has_changed=$(git diff --name-only $OLD_COMMIT...$NEW_COMMIT --exit-code $1)
    if [ -z "$file_has_changed" ]; then
        return 1
    else
        return 0
    fi
}

if check_diff "requirements.txt"; then
    echo "$EG install pip packages"
    pip install -r requirements.txt
    echo $SPACER
fi

if check_diff "package.json package-lock.json"; then
    echo "$EG install npm packages"
    npm ci
    echo $SPACER
fi

if check_diff "app/* config/webpack/*"; then
    echo "$EG build the app!"
    npm run build
    echo $SPACER
fi

if check_diff "config/heydari.uwsgi.service"; then
    echo "$EG update uwsgi service"
    cp config/heydari.uwsgi.service /etc/systemd/system/ --force
    systemctl daemon-reload
    echo $SPACER
fi

echo "$EG restart uwsgi service"
systemctl restart heydari.uwsgi
echo $SPACER

if check_diff "config/nginx.conf"; then
    echo "$EG restart nginx"
    systemctl restart nginx
    echo $SPACER
fi

echo "Deploy is Done! ✅"
