
SPACER="======================================"
EG="🔷"

cd /heydari/

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

if check_diff "config/heydari.service"; then
    echo "$EG reload the service"
    cp config/heydari.service /etc/systemd/system/ --force
    systemctl daemon-reload
    echo $SPACER
fi

if [ ! -f main.db ]; then
    echo "$EG setup the database"
    cargo sqlx db setup
    echo $SPACER
fi

if check_diff "migrations/*"; then
    echo "$EG update the database"
    cargo sqlx db setup
    echo $SPACER
fi

if check_diff "package.json"; then
    echo "$EG install npm packages"
    npm i
    echo $SPACER
fi

if check_diff "web/*"; then
    echo "$EG build the web!"
    npm run web
    echo $SPACER
fi

if check_diff "admin/*"; then
    echo "$EG build the admin!"
    npm run admin:build
    echo $SPACER
fi

if check_diff "src/*"; then
    echo "$EG cargo build"
    cargo build --release
    echo $SPACER
fi

if check_diff "src/* templates/*"; then
    echo "$EG restart heydari"
    systemctl restart heydari
    echo $SPACER
fi

if check_diff "config/nginx.conf"; then
    echo "$EG restart nginx"
    if nginx -t; then
        systemctl restart nginx
    else
        echo invalid nginx status ❌
    fi
    echo $SPACER
fi

echo "Deploy is Done! ✅"
