// allow user to edit data within their lift folder.
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

// This function updates a single exercise inside a lift folder on a specific date
export const updateLiftEntry = async ({
  userId,
  folderId,
  liftDate,
  liftIndex,
  updatedLiftData,
}) => {
  try {
    const folderRef = doc(
      FIREBASE_DB,
      "users",
      userId,
      "liftFolders",
      folderId
    );
    const docSnap = await getDoc(folderRef);

    if (!docSnap.exists()) {
      console.error("Folder not found");
      return { success: false, message: "Folder not found." };
    }

    const folderData = docSnap.data();
    const allExercises = folderData.exercises || [];

    // Step 1: Find the date group matching the liftDate
    const dateGroupIndex = allExercises.findIndex(
      (entry) => entry.date === liftDate
    );
    if (dateGroupIndex === -1) {
      console.error("No date group found for", liftDate);
      return { success: false, message: "No matching date group." };
    }

    const dateGroup = { ...allExercises[dateGroupIndex] };
    const exercisesInDate = [...dateGroup.exercises];

    // Step 2: Validate the liftIndex
    if (!exercisesInDate[liftIndex]) {
      console.error("Exercise index out of range");
      return { success: false, message: "Exercise not found at given index." };
    }

    // Step 3: Update the specific exercise
    exercisesInDate[liftIndex] = {
      ...exercisesInDate[liftIndex],
      ...updatedLiftData, // expected to include name, sets, or notes
    };

    // Step 4: Replace the updated date group back into the array
    const updatedDateGroup = {
      ...dateGroup,
      exercises: exercisesInDate,
    };

    const updatedAllExercises = [...allExercises];
    updatedAllExercises[dateGroupIndex] = updatedDateGroup;

    // Step 5: Save back to Firestore
    await updateDoc(folderRef, { exercises: updatedAllExercises });

    return { success: true };
  } catch (error) {
    console.error("Error updating lift:", error);
    return { success: false, message: "Error updating lift." };
  }
};
