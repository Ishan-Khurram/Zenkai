import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

export const updateRunEntry = async ({
  userId,
  folderId,
  runDate,
  runIndex,
  updatedRunData,
}) => {
  try {
    const folderRef = doc(FIREBASE_DB, "users", userId, "runFolders", folderId);
    const docSnap = await getDoc(folderRef);

    if (!docSnap.exists()) {
      console.error("Folder not found.");
      return { success: false, message: "Folder not found." };
    }

    const folderData = docSnap.data();
    const allRuns = folderData.runs || [];

    let dateMatchCount = 0;
    let actualIndex = -1;

    // Figure out the actual index of the run in the allRuns array
    for (let i = 0; i < allRuns.length; i++) {
      if (allRuns[i].date === runDate) {
        if (dateMatchCount === runIndex) {
          actualIndex = i;
          break;
        }
        dateMatchCount++;
      }
    }

    if (actualIndex === -1) {
      console.error("Run not found at given index.");
      return { success: false, message: "Run not found at given index." };
    }

    const updatedRuns = [...allRuns];
    updatedRuns[actualIndex] = {
      ...updatedRuns[actualIndex],
      ...updatedRunData,
    };

    await updateDoc(folderRef, { runs: updatedRuns });

    return { success: true };
  } catch (error) {
    console.error("Error updating run:", error);
    return { success: false, message: "Error updating run." };
  }
};
