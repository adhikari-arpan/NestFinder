import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import * as kycApi from "../api/kycApi";
import { ProgressTracker } from "../components/kyc/ProgressTracker";
import { StepPersonal } from "../components/kyc/StepPersonal";
import { StepAddress } from "../components/kyc/StepAddress";
import { StepLocation } from "../components/kyc/StepLocation";
import { StepDocuments } from "../components/kyc/StepDocuments";
import { StepReview } from "../components/kyc/StepReview";
import { LoadingScreen } from "../components/LoadingScreen";
import { IdCard } from "lucide-react";

export const KycVerification = () => {
  const { currentUser, authLoading, refreshCurrentUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [existing, setExisting] = useState(null); // previous kyc_verifications row, if any

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [tole, setTole] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [documentType, setDocumentType] = useState("citizenship");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentFrontFile, setDocumentFrontFile] = useState(null);
  const [documentBackFile, setDocumentBackFile] = useState(null);
  const [utilityBillType, setUtilityBillType] = useState("electricity");
  const [utilityBillFile, setUtilityBillFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate("/auth");
    }
  }, [currentUser, authLoading]);

  useEffect(() => {
    if (!currentUser) return;
    kycApi
      .fetchMyKYC(currentUser.id)
      .then((row) => {
        if (!row) {
          // No prior submission — prefill from the account's profile data
          // instead of making the landlord retype what they already gave us.
          const [first, ...rest] = (currentUser.name || "").trim().split(/\s+/);
          setFirstName(first || "");
          setLastName(rest.join(" "));
          setPhone(currentUser.phone || "");
          return;
        }
        setExisting(row);
        setFirstName(row.first_name);
        setLastName(row.last_name);
        setPhone(row.phone);
        setProvince(row.province);
        setDistrict(row.district);
        setMunicipality(row.municipality);
        setTole(row.tole);
        setLatitude(String(row.latitude));
        setLongitude(String(row.longitude));
        setDocumentType(row.document_type);
        setDocumentNumber(row.document_number);
        setUtilityBillType(row.utility_bill_type);
      })
      .catch((err) => console.error("Failed to load existing KYC:", err.message))
      .finally(() => setLoadingExisting(false));
  }, [currentUser]);

  if (authLoading) return <LoadingScreen />;
  if (!currentUser) return null;

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handlePick = (lat, lng) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await kycApi.submitKYC(
        currentUser.id,
        currentUser.email,
        {
          first_name: firstName,
          last_name: lastName,
          province,
          district,
          municipality,
          tole,
          phone,
          latitude: Number(latitude),
          longitude: Number(longitude),
          document_type: documentType,
          document_number: documentNumber,
          utility_bill_type: utilityBillType,
        },
        {
          document_front: documentFrontFile,
          document_back: documentType === "citizenship" ? documentBackFile : null,
          utility_bill: utilityBillFile,
          selfie: selfieFile,
        },
      );
      await refreshCurrentUser();
      navigate("/dashboard/landlord");
    } catch (err) {
      console.error("Failed to submit KYC:", err.message);
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingExisting) {
    return <LoadingScreen label="Loading your KYC details..." />;
  }

  return (
    <div className="container min-h-screen max-w-220 px-4 pt-10 pb-32 text-left sm:px-10">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-lg bg-(--primary) text-white shadow-lg">
          <IdCard size={30} />
        </div>
        <div>
          <h1 className="m-0 text-[1.8rem] font-extrabold">KYC Verification</h1>
          <p className="mt-1 text-[0.95rem] text-(--text-muted)">
            {existing?.status === "rejected"
              ? "Update and resubmit your details below."
              : "Verify your identity to start posting room listings."}
          </p>
        </div>
      </div>

      <ProgressTracker step={step} />

      {step === 1 && (
        <StepPersonal
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={currentUser.email}
          phone={phone}
          setPhone={setPhone}
          onNext={nextStep}
        />
      )}

      {step === 2 && (
        <StepAddress
          province={province}
          setProvince={setProvince}
          district={district}
          setDistrict={setDistrict}
          municipality={municipality}
          setMunicipality={setMunicipality}
          tole={tole}
          setTole={setTole}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 3 && (
        <StepLocation
          latitude={latitude}
          longitude={longitude}
          onPick={handlePick}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 4 && (
        <StepDocuments
          documentType={documentType}
          setDocumentType={setDocumentType}
          documentNumber={documentNumber}
          setDocumentNumber={setDocumentNumber}
          documentFrontFile={documentFrontFile}
          setDocumentFrontFile={setDocumentFrontFile}
          documentBackFile={documentBackFile}
          setDocumentBackFile={setDocumentBackFile}
          utilityBillType={utilityBillType}
          setUtilityBillType={setUtilityBillType}
          utilityBillFile={utilityBillFile}
          setUtilityBillFile={setUtilityBillFile}
          selfieFile={selfieFile}
          setSelfieFile={setSelfieFile}
          existing={existing}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 5 && (
        <StepReview
          data={{
            firstName,
            lastName,
            email: currentUser.email,
            phone,
            province,
            district,
            municipality,
            tole,
            latitude,
            longitude,
            documentType,
            documentNumber,
            documentFrontFile,
            documentBackFile,
            utilityBillType,
            utilityBillFile,
            selfieFile,
            hasExistingSelfie: !!existing?.selfie_url,
          }}
          onSubmit={handleSubmit}
          onBack={prevStep}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </div>
  );
};
