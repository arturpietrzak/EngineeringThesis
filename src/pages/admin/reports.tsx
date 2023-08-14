import {
  Table,
  Pagination,
  Modal,
  Text,
  Button,
  Flex,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Head from "next/head";
import { useEffect, useState } from "react";
import { IconArrowsSort, IconBan, IconThumbUp } from "@tabler/icons-react";
import { Loader } from "../../components/Loader";
import { api } from "~/utils/api";
import { AdminPost } from "~/components/AdminPost";

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("asc");
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedReport, setSelectedReport] = useState("");
  const reviewReportMutation = api.admin.reviewReport.useMutation();

  const { data: reportsData, refetch: refetchReportsData } =
    api.admin.getReports.useQuery({
      page: page,
      sortOption,
    });

  const { data: selectedReportData, refetch: selectedReportDataRefetch } =
    api.admin.getReportedPost.useQuery(
      {
        reportId: selectedReport,
      },
      {
        enabled: false,
      }
    );

  useEffect(() => {
    if (selectedReport) {
      void selectedReportDataRefetch();
    }
  }, [selectedReport, selectedReportDataRefetch]);

  if (!reportsData) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Knowhow | Resolve reports</title>
      </Head>
      <Modal opened={opened} onClose={close} title="Review" size="xl">
        <Stack>
          {selectedReportData && (
            <AdminPost content={selectedReportData.post.content} />
          )}
          <Flex justify="space-between">
            <Button
              color="green"
              variant="outline"
              onClick={async () => {
                await reviewReportMutation.mutateAsync({
                  reportId: selectedReport,
                  shouldPostBeRemoved: false,
                });
                void refetchReportsData();
                setSelectedReport("");
                close();
              }}
            >
              <IconThumbUp size={20} style={{ marginRight: 4 }} />
              Leave
            </Button>
            <Button
              color="red"
              variant="outline"
              onClick={async () => {
                await reviewReportMutation.mutateAsync({
                  reportId: selectedReport,
                  shouldPostBeRemoved: true,
                });
                void refetchReportsData();
                setSelectedReport("");
                close();
              }}
            >
              <IconBan size={20} style={{ marginRight: 4 }} />
              Remove
            </Button>
          </Flex>
        </Stack>
      </Modal>
      <ReportsTable
        onReviewClick={(id) => {
          setSelectedReport(id);
          open();
        }}
        onSortClick={() => {
          setSortOption((prev) => (prev === "asc" ? "desc" : "asc"));
        }}
        reports={[...reportsData.reports]}
      />
      <Pagination
        total={reportsData.pages}
        value={page}
        onChange={setPage}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      />
    </>
  );
}

function ReportsTable({
  reports,
  onSortClick,
  onReviewClick,
}: {
  reports: {
    id: string;
    postId: string;
    createdAt: string;
    reason: string;
    category: string;
  }[];
  onSortClick: () => void;
  onReviewClick: (id: string) => void;
}) {
  const ths = (
    <tr>
      <th onClick={onSortClick}>
        <IconArrowsSort size={12} style={{ marginRight: 6 }} />
        Reported at
      </th>
      <th>Reason</th>
      <th>Action</th>
    </tr>
  );

  const rows = reports.map((r) => (
    <tr key={r.id}>
      <td>{r.createdAt}</td>
      <td>
        <Text tt="capitalize" component="span" c="red">
          {r.category}:
        </Text>{" "}
        {r.reason}
      </td>
      <td>
        <Button variant="outline" onClick={() => onReviewClick(r.id)}>
          Review
        </Button>
      </td>
    </tr>
  ));

  return (
    <Table>
      <thead>{ths}</thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}
