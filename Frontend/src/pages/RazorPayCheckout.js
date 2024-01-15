import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentOrder,
  updateOrderAsync,
} from "../features/order/orderSlice";
import { useNavigate } from "react-router-dom";

const RazorpayCheckout = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const currentOrder = useSelector(selectCurrentOrder);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOrderStatus = (order) => {
    const updatedOrder = {
      ...order,
      status: "confirmed",
      paymentStatus: "Successful",
    };
    dispatch(updateOrderAsync(updatedOrder));

    navigate('/');
  };

  useEffect(() => {
    // Fetch order details from the server
    fetch("/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalAmount: currentOrder.totalAmount,
        orderId: currentOrder.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => setOrderDetails(data))
      .catch((error) =>
        console.error("Error fetching Razorpay intent:", error)
      );
  }, [currentOrder]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      handleOrderStatus(currentOrder);
      script.onerror = (error) => {
        console.error("Error loading Razorpay script:", error);
        resolve(); // Resolve the promise even if there's an error
      };
      document.body.appendChild(script);
    });
  };

  const openRazorpayCheckout = async () => {
    await loadRazorpayScript();

    const razorpayOptions = {
      key: "rzp_test_6Wc5R9YbC47wAl", // Replace with your Razorpay key
      amount: currentOrder.totalAmount * 100,
      currency: "INR",
      name: "E-Commerce",
      description: "Payment for Order",
      order_id: orderDetails.id,
      handler: async (response) => {
        // Handle the successful payment response
        console.log(response);
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "1234567890",
      },
      notes: {
        orderId: currentOrder.id,
      },
      theme: {
        color: "#F37254", // Customize the color
      },
    };

    // Open the Razorpay checkout
    const razorpayInstance = new window.Razorpay(razorpayOptions);
    razorpayInstance.open();
  };

  return (
    <div className="text-2xl flex justify-center mt-80 bg-green-500 text-white rounded-full mx-auto w-96 py-10">
      {orderDetails && (
        <button onClick={openRazorpayCheckout}>Pay with Razorpay</button>
      )}
    </div>
  );
};

export default RazorpayCheckout;
