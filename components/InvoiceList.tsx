import {
  JSXElementConstructor,
  Key,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Card,
  Text,
  Button,
  Modal,
  Grid,
  Spacer,
  Loading,
} from "@nextui-org/react";
import axios from "axios";
import { Trash2, Download } from "react-feather";

async function fetchInvoices() {
  const res = await axios.get("/api/invoices");
  return res.data;
}

async function deleteInvoice(invoiceId: any) {
  const res = await axios.delete(`/api/invoices/${invoiceId}`);
  return res.data;
}

export default function InvoiceList() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const queryClient = useQueryClient();
  const { data: invoices, isLoading } = useQuery("invoices", fetchInvoices);
  const deleteMutation = useMutation(deleteInvoice, {
    onSuccess: () => {
      queryClient.invalidateQueries("invoices");
    },
  });
  // @ts-ignore
  const handleDelete = (invoiceId) => {
    setSelectedInvoice(invoiceId);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedInvoice);
    setSelectedInvoice(null);
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Card>
      <Card.Header>
        <Text h3>Your Documents</Text>
      </Card.Header>
      <Card.Body>
        {invoices.map((invoice: any) => (
          <>
            <div
              key={invoice._id}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
              }}
            >
              <Text h5>{invoice.file_name}</Text>
              <Text h6 color="secondary">
                {new Date(invoice.created_at).toLocaleDateString()}
              </Text>
              <div
                style={{
                  display: "flex",
                  flexGrow: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  auto
                  color={"primary"}
                  size="sm"
                  onClick={() => window.open(`/api/download/${invoice._id}`)}
                >
                  <Download />
                </Button>
                <Spacer x={0.5} />
                <Button
                  color={"error"}
                  auto
                  size="sm"
                  onClick={() => handleDelete(invoice._id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <Spacer y={0.5} />
          </>
        ))}
      </Card.Body>
      <Modal
        open={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        style={{
          padding: "1rem",
        }}
      >
        <Text h3>Delete Invoice</Text>
        <Text>Are you sure you want to delete this invoice?</Text>
        <Spacer y={1} />
        {deleteMutation.isLoading ? (
          <Loading />
        ) : (
          <Button onClick={confirmDelete}>Confirm</Button>
        )}
      </Modal>
    </Card>
  );
}
