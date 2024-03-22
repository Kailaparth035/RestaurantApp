/* eslint-disable no-else-return */
import { setCachedItem } from "../../helpers/storeData";
import { getClerkUsers } from "../../fragments/resolvers";
import { KEY_NAME } from "../../helpers/constants";

export const NewSyncUsers = async (client, organizationId, database) => {
  const users = database.collections.get("users");
  try {
    let res = await client.query({
      query: getClerkUsers,
      variables: {
        organizationId,
      },
    });

    if (res.data.users.length > 0) {
      try {
        await database.write(async () => {
          let localUsers = await database.collections.get("users").query().fetch();
          const deleteAllLocalUsers = localUsers.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalUsers);
        });
      } catch (error) {
        console.log("delete local users tabale error :: ", error);
      }

      // console.log("@@====res.data.users======",res.data.users)
      const batchActions = [];
      const usersInsert = res.data.users.map(async (user) => {
        batchActions.push(
          users.prepareCreate((record) => {
            record._raw.id = user.id.toString();
            record.userId = user.id;
            record.email = user.email;
            record.eventId = user.event_id;
            record.organisationId = user.organization_id;
            record.passwordHash = user.password_hash;
            record.phoneNumber = user.phone_number;
            record.roleId = user.role_id;
            record.tabletAccessCode = user.tablet_access_code;
            record.username = user.username;
            record.validationTime = user.validation_time;
          })
        );
        return true;
      });
      await Promise.all(usersInsert);
      try {
        await database.write(async () => {
          try {
            await database.batch(batchActions);
            await setCachedItem(KEY_NAME.USERS_SYNC, 'true');
            console.log("@@==User Done ===")
          } catch (error) {
            console.log({ error });
          }
        });
      } catch (error) {
        console.log({ error });
      }
    }
  } catch (e) {
    console.log("sync users error", e);
    return e;
  }
};
