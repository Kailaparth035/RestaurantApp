/* eslint-disable react/prop-types */
import React, { createContext, useState } from "react";

export const DiscountContext = createContext();

const DiscountContextProvider = ({ children }) => {
  const [discount, setDiscount] = useState();
  const [discountType, setDiscountType] = useState(null);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isDiscounted, setIsDiscounted] = useState(false);
  const [selectedDiscounts, setselectedDiscounts] = useState([]);

  const addSelectedDiscount = (disc) => {
    setselectedDiscounts(prevState => [...prevState, disc]);
  }

  const removeSelectedDiscount = (disc) => {
    const removeDiscIndex = selectedDiscounts.findIndex(d => {
      return d.code === disc.code
    });
    const updatedDiscounts = [...selectedDiscounts];
    updatedDiscounts.splice(removeDiscIndex, 1)
    setselectedDiscounts(updatedDiscounts);
  }

  const resetSelectedDiscounts = () => {
    setselectedDiscounts([]);
  }
  
  return (
    <DiscountContext.Provider
      value={{
        discount,
        setDiscount,
        discountType,
        setDiscountType,
        previousIndex,
        setPreviousIndex,
        selectedDiscount,
        setSelectedDiscount,
        isDiscounted,
        setIsDiscounted,
        selectedDiscounts,
        addSelectedDiscount,
        removeSelectedDiscount,
        resetSelectedDiscounts
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscountContext = () => React.useContext(DiscountContext);

export default DiscountContextProvider;
