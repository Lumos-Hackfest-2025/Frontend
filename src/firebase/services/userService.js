import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Process Buyer Data
export async function processBuyerData(buyerData) {
  const requiredFields = ["buyerEmail", "buyerUid", "buyerRole", "NIK", "NIB"];
  for (const field of requiredFields) {
    if (!buyerData[field]) {
      return { success: false, error: `Missing required field: ${field}` };
    }
  }
  try {
    await setDoc(doc(db, "Buyer", buyerData.buyerUid), buyerData, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Process Seller Data
export async function processSellerData(sellerData) {
  const requiredFields = ["sellerEmail", "userUid", "idFarmer", "imageKtp", "NIK"];
  for (const field of requiredFields) {
    if (!sellerData[field]) {
      return { success: false, error: `Missing required field: ${field}` };
    }
  }
  try {
    await setDoc(doc(db, "Seller", sellerData.userUid), sellerData, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
