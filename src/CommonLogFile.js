import moment from "moment";
import RNFS from "react-native-fs";

export const WriteLog = async (message) => {
  const FILE_MAX_SIZE = 0.05; //Set in MB

  let timezone = new Date();
  let path;
  let filesize;
  let currentDirectory = "ronin_pos/";
  let folderpath = `/storage/emulated/0/Download/${currentDirectory}`;

  let messageLogs =
    "\n\n" +
    moment(timezone).format("YYYY/MM/DD HH:mm:ss") +
    " => " +
    JSON.stringify(message);

  const getFileName = () => {
    return (
      "ronin_pos_" + moment(timezone).format("YYYY_MM_DD_HH_mm_ss") + ".txt"
    );
  };

  try {
    await RNFS.mkdir(folderpath)
      .then(async (response) => {
        await RNFS.readDir(folderpath)
          .then(async (result) => {
            // console.log(
            //   "@@========before file deleted successfully ==== ",
            //   result.length
            // );
            if (result.length > 2) {
              for (let i = 0; i < result.length - 2; i++) {
                // console.log(
                //   "@@========result[i].path file deleted successfully ==== ",
                //   result[i].path
                // );
                path = result[i].path;
                await RNFS.unlink(path);
                //console.log("@@======== file deleted successfully ==== ");
              }
            }
            if (result.length === 0) {
              path = folderpath + getFileName();
              await RNFS.writeFile(path, messageLogs, "utf8")
                .then((success) => {
                  console.log("WRITE FILE WRITTEN!");
                })
                .catch((err) => {
                  console.log("@@========== RNFS.writeFile ===========", err.message);
                });
            } else {
              path = result[result.length - 1]?.path;
              filesize = (
                parseInt(result[result.length - 1]?.size) / 1048576
              ).toFixed(6);
              //console.log("filesize :::", filesize);
              if (filesize < FILE_MAX_SIZE) {
                path = result[result.length - 1].path;
                await RNFS.appendFile(path, messageLogs, "utf8")
                  .then((success) => {
                    // console.log("APPEND FILE WRITTEN!");
                  })
                  .catch((err) => {
                    console.log("@@========== RNFS.appendFile ===========", err.message);
                  });
              } else {
                path = folderpath + getFileName();
                await RNFS.writeFile(path, messageLogs, "utf8")
                  .then((success) => {
                    console.log("New file WRITE FILE WRITTEN!");
                  })
                  .catch((err) => {
                    console.log("@@========== RNFS.writeFile 1 ===========", err);
                  });
              }
            }
          })
          .catch(async (error) => {
            console.error("@@========== RNFS.readDir =========== ", error);
          });
      })
      .catch((err) => {
        // console.log("err ::;", err);
      });
  } catch (error) {
    console.error("@@========== RNFS.mkdir =========== ", error);
  }
};
