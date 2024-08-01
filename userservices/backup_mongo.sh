#!/bin/sh

#=====================================================================
# Set the following variables as per your requirement
#=====================================================================
# Source Database Name
SOURCE_DATABASE="userService"
BACKUPS_DIR="/var/backups"
# MongoDB Atlas connection string for source
SOURCE_MONGO_URI="mongodb+srv://lachongtechintern:hNX6k0uzO4pDphtM@cluster0.vluhdw4.mongodb.net/$SOURCE_DATABASE?retryWrites=true&w=majority&appName=Cluster0"
DAYSTORETAINBACKUP="1"
#=====================================================================

TIMESTAMP=$(date +%F-%H%M)
BACKUP_NAME="$SOURCE_DATABASE-$TIMESTAMP"

echo "Performing backup of $SOURCE_DATABASE"
echo "--------------------------------------------"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUPS_DIR/$SOURCE_DATABASE" ]; then
  echo "Backup directory $BACKUPS_DIR/$SOURCE_DATABASE does not exist. Creating it."
  mkdir -p "$BACKUPS_DIR/$SOURCE_DATABASE"
fi

# Create dump from source database
mongodump --uri="$SOURCE_MONGO_URI" --archive="$BACKUPS_DIR/$SOURCE_DATABASE/$BACKUP_NAME.archive"
DUMP_STATUS=$?

# Check if mongodump succeeded
if [ $DUMP_STATUS -ne 0 ]; then
  echo "mongodump failed. Check the connection string and database name." 1>&2
  exit 1
fi

# Clean up old backups (keep only the latest one)
# List all backup archives, sort by time, keep the latest one, delete the rest
ls -t "$BACKUPS_DIR/$SOURCE_DATABASE" | tail -n +2 | xargs -I {} rm "$BACKUPS_DIR/$SOURCE_DATABASE/{}"
# find $BACKUPS_DIR -type f -mtime +$DAYSTORETAINBACKUP -exec rm {} +
echo "--------------------------------------------"
echo "Database backup complete to $BACKUPS_DIR/$SOURCE_DATABASE/$BACKUP_NAME.archive!"
