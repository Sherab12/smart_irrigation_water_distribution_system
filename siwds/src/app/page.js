"use client"; // Ensure this is at the top

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react"; // No need to import React explicitly
import { ServerIcon, CogIcon, CloudIcon } from '@heroicons/react/outline';
import { Link as ScrollLink } from "react-scroll"; // Importing react-scroll Link component


// FAQ Component
const FAQ = () => {
  const faqData = [
    {
      question: "How does AgriFlow optimize water usage?",
      answer:
        "AgriFlow uses advanced sensors and AI algorithms to monitor soil moisture levels and distribute water precisely where and when it is needed.",
    },
    {
      question: "What makes AgriFlow different from other irrigation systems?",
      answer:
        "AgriFlow integrates seamlessly with IoT devices and provides real-time data insights to enhance efficiency and reduce water waste.",
    },
    {
      question: "Is AgriFlow compatible with existing irrigation systems?",
      answer:
        "Yes, AgriFlow is designed to integrate with most existing systems, allowing for a smooth upgrade to smart irrigation technology.",
    },
    {
      question: "What support does AgriFlow provide for new users?",
      answer:
        "We offer comprehensive onboarding, user guides, and 24/7 customer support to ensure a seamless experience for new users.",
    },
  ];

  return (
    <div className="faq-container w-full mt-20 pl-0 pr-0 mx-0">
      {/* FAQ Section */}
      <div className="faq-section space-y-0 w-full">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="faq-item bg-white p-1 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full"
          >
            <div className="flex justify-start items-center w-full text-left text-gray-800 text-lg font-semibold">
              {/* Question aligned to the left */}
              <span>{item.question}</span>
            </div>
            <p className="text-left text-gray-600 mt-4 text-md">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal for Contact Information
const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Contact Us</h2>
        <p className="text-md text-gray-600 mb-4">
          If you have any questions, feel free to reach out to us!
        </p>
        <p className="text-md text-gray-800">Email: support@agriflow.com</p>
        <p className="text-md text-gray-800">Phone: +1 (800) 123-4567</p>
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Home Component
export default function Home() {
  const [activeSection, setActiveSection] = useState("landing");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".section");
      const windowHeight = window.innerHeight;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionVisible = rect.top < windowHeight * 0.75 && rect.bottom > windowHeight * 0.25;

        if (sectionVisible) {
          section.classList.add("visible");
        } else {
          section.classList.remove("visible");
        }
      });
    };

    // Attach the scroll listener
    window.addEventListener("scroll", handleScroll);

    // Call once to handle sections already in view
    handleScroll();

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const linkClass = (section) => {
    return activeSection === section
      ? "text-blue-600"
      : "text-gray-600 hover:text-blue-600";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-gray-100 shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <div className="text-md font-bold text-blue-600">AgriFlow</div>
          <div className="flex gap-6">
            {/* ScrollLink for smooth scroll to sections */}
            <ScrollLink
              to="landing"
              smooth={true}
              className={linkClass("landing")}
              onClick={() => handleSectionChange("landing")}
            >
              Home
            </ScrollLink>
            <ScrollLink
              to="why-agriflow"
              smooth={true}
              className={linkClass("why-agriflow")}
              onClick={() => handleSectionChange("why-agriflow")}
            >
              Why AgriFlow
            </ScrollLink>
            <ScrollLink
              to="faq"
              smooth={true}
              className={linkClass("faq")}
              onClick={() => handleSectionChange("faq")}
            >
              FAQ
            </ScrollLink>
            <ScrollLink
              to="about-us"
              smooth={true}
              className={linkClass("about-us")}
              onClick={() => handleSectionChange("about-us")}
            >
              About Us
            </ScrollLink>
          </div>
        </div>
        <div className="ml-auto">
          <Link href="/login" className="text-gray-600 hover:text-blue-600 mr-10">
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-0 bg-white">
        {/* Landing Section */}
        <div id="landing" className="section w-full">
          <div className="relative w-full h-[600px]">
            <Image
              src="/i.jpg" // Make sure the image is in the public/images folder
              alt="Smart Irrigation"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
                Revolutionizing Smart Irrigation Water Distribution System
              </h1>
              <p className="text-md sm:text-lg mb-6">
                Optimize water usage, maximize crop yield, and embrace sustainability.
              </p>

              {/* ScrollLink for smooth scroll to "Why AgriFlow" */}
              <ScrollLink
                to="why-agriflow"
                smooth={true}
                className="bg-blue-600 py-1 px-3 rounded-full hover:bg-blue-700"
              >
                Learn More
              </ScrollLink>
            </div>
          </div>
        </div>

        {/* Why AgriFlow Section */}
        <div id="why-agriflow" className="bg-white py-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            {/* Title */}
            <h2 className="text-4xl font-semibold text-gray-800 mb-8">Why Choose AgriFlow?</h2>

            {/* Section Divider */}
            <div className="mb-10">
              <div className="w-32 h-1 mx-auto bg-blue-600"></div>
            </div>

            {/* Feature Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {/* Water Flow Monitoring */}
              <div className="flex flex-col items-center text-center space-y-4">
                <ServerIcon className="w-20 h-20 text-blue-600 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800">Real-Time Monitoring</h3>
                <p className="text-lg text-gray-600">
                  AgriFlow empowers admins with real-time data to monitor water distribution across the system, ensuring resources are allocated efficiently.
                </p>
              </div>

              {/* Automated Control */}
              <div className="flex flex-col items-center text-center space-y-4">
                <CogIcon className="w-20 h-20 text-green-600 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800">Automated Adjustments</h3>
                <p className="text-lg text-gray-600">
                  The system automatically adjusts irrigation flow based on real-time sensor data, ensuring optimal water distribution without manual intervention.
                </p>
              </div>

              {/* Resource Sustainability */}
              <div className="flex flex-col items-center text-center space-y-4">
                <CloudIcon className="w-20 h-20 text-yellow-600 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800">Optimized Resource Management</h3>
                <p className="text-lg text-gray-600">
                  AgriFlow helps admins manage limited water resources efficiently, reducing conflicts over water distribution and ensuring sustainable farming practices.
                </p>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="mt-12">
            <div className="w-32 h-1 mx-auto bg-blue-600"></div>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="section bg-white py-12 px-20 flex justify-between relative">
          <div className="faq-title fixed top-20 left-1/2 transform -translate-x-1/2 mt-12">
            <h1 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="w-full max-w-4xl pl-8 mt-12">
            <FAQ />
          </div>

          <div className="flex flex-col justify-end items-end h-screen pr-2 -mt-24 ">
            <p className="text-xs text-gray-400 text-right ">
              Can&apos;t find what you are looking for?{" "}
              <br />
              <span className="text-sm text-gray-600">We would like to chat with you.</span>
            </p>

            {/* Curly arrow pointing from the text to the chat icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="gray"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 transform rotate-90"
            >
              <path d="M12 2C7.033 2 3 6.033 3 10s4.033 8 9 8c4.15 0 7.5-2.953 8.5-6.976M16 8l4-4-4-4" />
            </svg>

            {/* Chat Icon */}
            <div
  className="chat-icon bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center center cursor-pointer"
  onClick={() => setIsModalOpen(true)} // Open modal when clicked
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="white"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
       d="M12 20.25c4.97 0 9-3.134 9-7.125S16.97 6 12 6s-9 3.134-9 7.125c0 1.77.828 3.374 2.19 4.59-.465 1.79-1.35 3.072-1.356 3.081a.75.75 0 00.935.974c2.346-.469 4.122-1.462 5.115-2.135a10.8 10.8 0 002.116.215z"
    />
  </svg>
</div>

          </div>

          <ContactModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          
      </div>
    </div>

    <div id="about-us" className="section w-full px-6 py-1 bg-gray-200 flex relative">
           <div className="w-[35%] pr-6">
           <div className="relative">
      {/* Container for images */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <Image
          src="/ct.png" // Image path
          alt="CST"
          width={90}   // Fixed width of 90 pixels
          height={90}  // Fixed height of 90 pixels
          objectFit="cover"
        />
        <Image
          src="/amtc.png" // Image path
          alt="AMTC"
          width={100}   // Fixed width of 90 pixels
          height={100}  // Fixed height of 90 pixels
          objectFit="cover"
        />
      </div>

      {/* Text content */}
      <p className="text-xs text-gray-700 text-left ">
Welcome to our project, a collaboration between the College of Science and Technology and the Agriculture Machinery and Technology Centre. Developed by four final-year BE.IT students, we aim to use technology to improve irrigation water distribution and create solutions for farmers and stakeholders. By combining agricultural machinery expertise with IT, we bridge the gap between traditional practices and modern technology, promoting growth, efficiency, and sustainability. Thank you for supporting our journey!
      </p>
    </div>
  </div>
  <div className="w-[60%] pl-6">
    <div className="grid grid-cols-2 gap-4">
      {/* Contact Information */}
      <div className=" space-y-2">
        <div>
          <h2 className="text-sm font-bold">Phone Number</h2>
          <p className="text-xs">+91 80004 36640</p>
        </div>
        <div>
          <h2 className="text-sm font-bold">Email</h2>
          <p className="text-xs">info@expertwebdesigning.com</p>
          <p className="text-xs">sales@expertwebdesigning.com</p>
        </div>
        <div>
          <h2 className="text-sm font-bold">Location</h2>
          <p className="text-xs">
            518, Rhythm Plaza, Amar Javan Circle, Nikol, Ahmedabad, Gujarat - 382350
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold">Working Hours</h2>
          <p className="text-xs">Monday to Saturday</p>
          <p className="text-xs">09:00 AM to 06:00 PM</p>
        </div>
      </div>

      </div>


</div>
</div>
</div>

    
  );
}