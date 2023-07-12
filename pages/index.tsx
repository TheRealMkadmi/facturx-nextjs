import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import {
  Button,
  Input,
  Card,
  Text,
  Spacer,
  Grid,
  useTheme,
} from "@nextui-org/react";

async function uploadFile(file: string | Blob) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Network response was not ok");
  }

  return res.json();
}

export default function Home() {
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();
  const theme = useTheme();

  const mutation = useMutation(uploadFile, {
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = `/api/download/${data.id}`;
      link.download = "invoice.xml";
      link.click();

      queryClient.invalidateQueries("invoices");
    },
  });
  // @ts-ignore
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    // @ts-ignore
    mutation.mutate(file);
  };

  return (
    <Grid.Container
      justify="center"
      alignContent="center"
      style={{ minHeight: "100vh", padding: "2rem" }}
    >
      <Grid xs={24} sm={16} md={12} lg={8} xl={6}>
        <Text
          h2
          style={{
            textAlign: "center",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          Invoice Parser
        </Text>

        <Spacer y={1} />
        <Card>
          <Card.Body
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text h3>Upload your PDF</Text>
            <Spacer y={1} />

            <Input type="file" onChange={handleFileChange} />
            <Button
              auto
              style={{ width: "100%" }}
              onClick={handleUpload}
              disabled={!file}
            >
              Upload
            </Button>
          </Card.Body>
        </Card>
      </Grid>
    </Grid.Container>
  );
}
