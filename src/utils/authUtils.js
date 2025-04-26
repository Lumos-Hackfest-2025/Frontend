import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Custom hook to check authentication and role
export const useAuthCheck = (requiredRole) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          // No user is signed in, redirect to login
          navigate('/login');
          return;
        }

        // User is authenticated, now check their role if a specific role is required
        if (requiredRole) {
          const uid = currentUser.uid;
          
          // Check in buyers collection if buyer role is required
          if (requiredRole === 'buyer') {
            const buyerDoc = await getDoc(doc(db, 'buyers', uid));
            if (!buyerDoc.exists()) {
              // User is not a buyer, check if they're a seller
              const sellerDoc = await getDoc(doc(db, 'sellers', uid));
              if (sellerDoc.exists()) {
                navigate('/seller/dashboard'); // They're a seller, redirect to seller dashboard
              } else {
                navigate('/login'); // Not found in either collection
              }
              return;
            }
          }
          
          // Check in sellers collection if seller role is required
          if (requiredRole === 'seller') {
            const sellerDoc = await getDoc(doc(db, 'sellers', uid));
            if (!sellerDoc.exists()) {
              // User is not a seller, check if they're a buyer
              const buyerDoc = await getDoc(doc(db, 'buyers', uid));
              if (buyerDoc.exists()) {
                navigate('/catalog'); // They're a buyer, redirect to catalog
              } else {
                navigate('/login'); // Not found in either collection
              }
              return;
            }
          }
        }
        
        // User is authenticated and has the required role (if any)
        setUser(currentUser);
      } catch (err) {
        console.error("Auth check error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, requiredRole]);

  return { user, loading, error };
};

// Function to get user type from Firestore
export const getUserType = async (uid) => {
  try {
    // Check in buyers collection
    const buyerDoc = await getDoc(doc(db, 'buyers', uid));
    if (buyerDoc.exists()) {
      return 'buyer';
    }
    
    // Check in sellers collection
    const sellerDoc = await getDoc(doc(db, 'sellers', uid));
    if (sellerDoc.exists()) {
      return 'seller';
    }
    
    // User not found in either collection
    return null;
  } catch (error) {
    console.error("Error getting user type:", error);
    throw error;
  }
};
