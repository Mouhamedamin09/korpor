/* -------------------------------------------------------------------------- */
/*  Array that drives the onboarding flow                                     */
/* -------------------------------------------------------------------------- */
const Onboarding1 = require("@assets/Onboarding1.png");
const Onboarding2 = require("@assets/Onboarding2.png");
const Onboarding3 = require("@assets/Onboarding3.png");
const Onboarding4 = require("@assets/Onboarding4.png");

export interface OnboardingPage {
  title: string;
  description: string;
  buttonText: string;
  image: any;
}

const pages: OnboardingPage[] = [
  {
    title: "Welcome to Korpor",
    description:
      "Meet your new investing companion. With Korpor, anyone can tap into real-estate opportunities in just a few taps.",
    buttonText: "Next",
    image: Onboarding1,
  },
  {
    title: "Invest With Confidence",
    description:
      "Fractional shares in vetted properties help you grow wealth without huge capital. Watch your money work harder for you.",
    buttonText: "Next",
    image: Onboarding2,
  },
  {
    title: "Real-Time Portfolio Tracking",
    description:
      "Stay on top of every rent payout and appreciation curve with beautiful, live analytics designed for clarity.",
    buttonText: "Next",
    image: Onboarding3,
  },
  {
    title: "Ready for Lift-Off",
    description:
      "Launch your financial journey today! Create your Korpor account and join thousands building their future.",
    buttonText: "Finish",
    image: Onboarding4,
  },
];

export default pages;
