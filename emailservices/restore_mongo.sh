#!/bin/sh

#=====================================================================
# Set the following variables as per your requirement
#=====================================================================
# Source Database Name (from where backup was taken)
SOURCE_DATABASE="emailService"
# Destination Database Name (where backup will be restored)
BACKUPS_DIR="/var/backups"
# MongoDB Atlas connection string for destination
DESTINATION_MONGO_URI="mongodb://10.100.1.153:27021/$SOURCE_DATABASE?compressors=disabled&gssapiServiceName=mongodb"

#=====================================================================

# List the backup archive files in the backup directory
ls "$BACKUPS_DIR/$SOURCE_DATABASE"

echo "Performing restore to $DESTINATION_DATABASE"
echo "--------------------------------------------"

# Check if backup directory exists
if [ ! -d "$BACKUPS_DIR/$SOURCE_DATABASE" ]; then
  echo "Backup directory $BACKUPS_DIR/$SOURCE_DATABASE does not exist. Exiting." 1>&2
  exit 1
fi

# Find the latest backup archive file
LATEST_ARCHIVE=$(ls -t "$BACKUPS_DIR/$SOURCE_DATABASE" | head -n 1)

# Check if the latest archive file exists
if [ -z "$LATEST_ARCHIVE" ]; then
  echo "No backup archive found in $BACKUPS_DIR/$SOURCE_DATABASE. Exiting." 1>&2
  exit 1
fi

# Restore dump to destination database
mongorestore --uri="$DESTINATION_MONGO_URI" --archive="$BACKUPS_DIR/$SOURCE_DATABASE/$LATEST_ARCHIVE" --nsFrom="$SOURCE_DATABASE.*" --nsTo="$SOURCE_DATABASE.*"
RESTORE_STATUS=$?

# Check if mongorestore succeeded
if [ $RESTORE_STATUS -ne 0 ]; then
  echo "mongorestore failed. Check the connection string and database name." 1>&2
  exit 1
fi

echo "--------------------------------------------"
echo "Database restore complete to $SOURCE_DATABASE!"
