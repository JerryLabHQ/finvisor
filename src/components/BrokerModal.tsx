"use client";

import { ConsultationModal, ConsultationModalProps } from "./ConsultationModal";

export function BrokerModal(props: ConsultationModalProps) {
  return <ConsultationModal {...props} context={props.context || "MORTGAGE"} />;
}

export { ConsultationModal };
export default BrokerModal;
