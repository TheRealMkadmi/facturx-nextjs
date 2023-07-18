import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Button, Input, Card, Text, Spacer, Progress } from "@nextui-org/react";

async function uploadFile(file: string | Blob) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    alert("Something went wrong");
    throw new Error("Network response was not ok");
  }

  return res.json();
}

export default function UploadCard() {
  const [file, setFile] = useState(null);
  const [inputKey, setInputKey] = useState(Date.now());
  const queryClient = useQueryClient();

  const mutation = useMutation(uploadFile, {
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = `/api/download/${data.id}`;
      link.download = "invoice.xml";
      link.click();

      setFile(null);
      setInputKey(Date.now());

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
    <Card>
      <Card.Header>
        <Text h3>Upload your PDF</Text>
      </Card.Header>
      <Card.Body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Input
          type="file"
          onChange={handleFileChange}
          key={inputKey}
          style={{
            height: "auto",
          }}
        />
        <Spacer y={1} />
        <Button
          auto
          shadow
          style={{ width: "100%" }}
          onClick={handleUpload}
          disabled={!file || mutation.isLoading}
        >
          Upload
        </Button>
        {mutation.isLoading && (
          <>
            <Spacer y={1} />
            <Progress
              indeterminated
              value={50}
              color="secondary"
              status="secondary"
            />
          </>
        )}
      </Card.Body>
    </Card>
  );
}
