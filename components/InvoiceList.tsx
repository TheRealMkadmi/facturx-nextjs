import { useQuery, useMutation, useQueryClient } from "react-query";
import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
import {
  Modal,
  Button,
  Grid,
  Spacer,
  Loading,
  Pagination,
  Table,
  Row,
  Text,
  Col,
  Card,
} from "@nextui-org/react";
import axios from "axios";
import { Trash2, Download } from "react-feather";
import { IconButton } from "./reusable/IconButton";
import { DeleteIcon } from "./reusable/icons/DeleteIcon";
import { EyeIcon } from "./reusable/icons/EyeIcon";
import { DocumentIcon } from "./reusable/icons/DocumentIcon";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

async function fetchInvoices(page: number) {
  const res = await axios.get(`/api/invoices?page=${page}&per_page=5`);
  return res.data;
}

async function deleteInvoice(invoiceId: any) {
  const res = await axios.delete(`/api/invoices/${invoiceId}`);
  return res.data;
}

async function fetchPdf(id: string) {
  const res = await fetch(`/api/pdf/${id}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

const columns = [
  { name: "File Name", uid: "file_name" },
  { name: "Created At", uid: "created_at" },
  { name: "Actions", uid: "actions" },
];

export default function InvoiceList() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfInvoiceId, setPdfInvoiceId] = useState<string>("");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: invoiceData, isLoading } = useQuery(["invoices", page], () =>
    fetchInvoices(page)
  );
  const deleteMutation = useMutation(deleteInvoice, {
    onSuccess: () => {
      queryClient.invalidateQueries("invoices");
    },
  });

  const { data: pdfUrl } = useQuery(
    ["pdf", pdfInvoiceId],
    () => fetchPdf(pdfInvoiceId!),
    { enabled: pdfModalOpen } // Only fetch the PDF when the modal is open
  );

  // @ts-ignore
  const handleDelete = (invoiceId) => {
    setSelectedInvoice(invoiceId);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedInvoice);
    setSelectedInvoice(null);
  };

  const handlePdfPreview = (invoiceId: string) => {
    if (invoiceId) {
      setPdfInvoiceId(invoiceId);
      setPdfModalOpen(true);
    }
  };

  if (isLoading) {
    return <Loading size="lg">Loading</Loading>;
  }

  const renderCell = (item: any, columnKey: any) => {
    const cellValue = item[columnKey];
    switch (columnKey) {
      case "file_name":
        return <Text>{cellValue}</Text>;
      case "created_at":
        return <Text>{new Date(cellValue).toLocaleDateString()}</Text>;
      case "actions":
        return (
          <Row justify="center" align="center">
            <Col css={{ d: "flex" }}>
              <IconButton
                onClick={() => window.open(`/api/download/${item._id}`)}
              >
                <EyeIcon size={20} fill="#979797" />
              </IconButton>
            </Col>
            <Col css={{ d: "flex" }}>
              <IconButton onClick={() => handleDelete(item._id)}>
                <DeleteIcon size={20} fill="#FF0080" />
              </IconButton>
            </Col>
            <Col css={{ d: "flex" }}>
              <IconButton onClick={() => handlePdfPreview(item._id)}>
                <DocumentIcon size={20} fill="#FF0080" />
              </IconButton>
            </Col>
          </Row>
        );
    }
  };

  return (
    <Card>
      <Card.Header>
        <Text h3>Your Documents</Text>
      </Card.Header>
      <Card.Body>
        <Table
          selectionMode="none"
          lined
          headerLined
          shadow={true}
          hoverable={true}
        >
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column
                key={column.uid}
                hideHeader={column.uid === "actions"}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </Table.Column>
            )}
          </Table.Header>
          <Table.Body
            items={invoiceData.invoices.map((invoice: any) => ({
              ...invoice,
              key: invoice._id,
            }))}
          >
            {(item) => (
              <Table.Row>
                {(columnKey) => (
                  <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                )}
              </Table.Row>
            )}
          </Table.Body>
          <Table.Pagination
            shadow
            noMargin
            align="center"
            rowsPerPage={3}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </Table>
      </Card.Body>

      <Modal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        style={{
          padding: "1rem",
          height: "80%", // Adjust as needed
          maxWidth: "none",
        }}
      >
        <Text h3>PDF Preview</Text>
        <div style={{ height: "600px", overflowY: "scroll" }}>
          {" "}
          {/* Make the PDF scrollable */}
          <Document file={pdfUrl} onLoadError={console.error}>
            <Page pageNumber={1} />
          </Document>
        </div>
        <Spacer y={1} />
        <Button onClick={() => setPdfModalOpen(false)}>Close</Button>
      </Modal>
    </Card>
  );
}
