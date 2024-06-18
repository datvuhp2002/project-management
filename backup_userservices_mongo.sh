#!/bin/sh

#=====================================================================
# Set the following variables as per your requirement
#=====================================================================
# Source Database Name
SOURCE_DATABASE="userService"
BACKUPS_DIR="/var/backups"
# Destination Database Name
DESTINATION_DATABASE="userServicesBackupDatabase"
# MongoDB Atlas connection string for source
SOURCE_MONGO_URI="mongodb+srv://lachongtechintern:hNX6k0uzO4pDphtM@cluster0.vluhdw4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# MongoDB Atlas connection string for destination
DESTINATION_MONGO_URI="mongodb+srv://datvuhp2002:ZRsh0pm9oxwNuVjB@databasebackup.4o9hedq.mongodb.net/?retryWrites=true&w=majority&appName=databasebackup"
# Days to keep the backup
DAYSTORETAINBACKUP="1"
#=====================================================================

TIMESTAMP=$(date +%F-%H%M)
BACKUP_NAME="$SOURCE_DATABASE-$TIMESTAMP"

echo "Performing backup of $SOURCE_DATABASE to $DESTINATION_DATABASE"
echo "--------------------------------------------"

# Create backup directory
if ! mkdir -p "$BACKUPS_DIR/$SOURCE_DATABASE"; then
  echo "Can't create backup directory in $BACKUPS_DIR. Go and fix it!" 1>&2
  exit 1;
fi

# Create dump from source database
mongodump --uri="$SOURCE_MONGO_URI" --archive="$BACKUPS_DIR/$SOURCE_DATABASE/$BACKUP_NAME.archive"
DUMP_STATUS=$?

# Check if mongodump succeeded
if [ $DUMP_STATUS -ne 0 ]; then
  echo "mongodump failed. Check the connection string and database name." 1>&2
  exit 1;
fi

# Restore dump to destination database
mongorestore --uri="$DESTINATION_MONGO_URI" --archive="$BACKUPS_DIR/$SOURCE_DATABASE/$BACKUP_NAME.archive" --nsFrom="$SOURCE_DATABASE.*" --nsTo="$DESTINATION_DATABASE.*"
RESTORE_STATUS=$?

# Check if mongorestore succeeded
if [ $RESTORE_STATUS -ne 0 ]; then
  echo "mongorestore failed. Check the connection string and database name." 1>&2
  exit 1;
fi

# Compress backup
tar -zcvf "$BACKUPS_DIR/$SOURCE_DATABASE/$BACKUP_NAME.tgz" "$BACKUPS_DIR/$SOURCE_DATABASE/$BACKUP_NAME.archive"

# Delete the temporary archive file
rm "$BACKUPS_DIR/$SOURCE_DATABASE/$BACKUP_NAME.archive"

# Delete backups older than retention period
find "$BACKUPS_DIR/$SOURCE_DATABASE" -type f -mtime +$DAYSTORETAINBACKUP -exec rm {} +
echo "--------------------------------------------"
echo "Database backup complete from $SOURCE_DATABASE to $DESTINATION_DATABASE!"
