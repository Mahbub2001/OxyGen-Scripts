'use client'
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:8000/register", data);
      setMessage(response.data.message);
      toast.success(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="flex-col border bg-gray-800 px-8 py-10 shadow-lg rounded-md w-[30rem]">
        <div className="mb-6 flex justify-center">
          <h1 className="text-2xl font-bold text-yellow-400">Sign Up</h1>
        </div>

        {message && (
          <div className="mb-4 text-center text-sm text-green-400">{message}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col text-sm">
          <input
            className="mb-3 rounded-md border p-3 focus:outline-none focus:border-yellow-500 bg-gray-700 text-white"
            type="text"
            placeholder="Full Name"
            {...register("full_name", { required: "Full Name is required" })}
          />
          {errors.full_name && <p className="text-red-500">{errors.full_name.message}</p>}

          <input
            className="mb-3 rounded-md border p-3 focus:outline-none focus:border-yellow-500 bg-gray-700 text-white"
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}

          <input
            className="mb-3 rounded-md border p-3 focus:outline-none focus:border-yellow-500 bg-gray-700 text-white"
            type="text"
            placeholder="Student ID"
            {...register("user_id", { required: "Student ID is required" })}
          />
          {errors.user_id && <p className="text-red-500">{errors.user_id.message}</p>}

          <input
            className="border rounded-md p-3 focus:outline-none focus:border-yellow-500 bg-gray-700 text-white"
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required", minLength: 6 })}
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}

          <button
            className="mt-5 w-full p-3 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white rounded-md hover:opacity-80 transition duration-300"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
