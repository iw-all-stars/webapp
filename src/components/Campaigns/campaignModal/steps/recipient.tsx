/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from "react";
import {
  useTable,
  usePagination,
  type Column,
  type HeaderGroup,
  type Row,
  type Cell,
} from "react-table";
import { MdSearch } from "react-icons/md";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  FormControl,
  Input,
  InputRightAddon,
  InputGroup,
  Flex,
  Tooltip,
  IconButton,
  Text,
  Select,
  Stat,
  StatHelpText,
  StatNumber,
  Switch,
  Icon,
} from "@chakra-ui/react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@chakra-ui/icons";
import { type Recipient } from "..";
import { RxPaperPlane } from "react-icons/rx";

interface RecipientStepProps {
  sent: boolean;
  columns: Column<object>[];
  data: Row<object>[];
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  setSearch: (search: string) => void;
}

export const RecipientStep = ({
  sent,
  columns,
  data,
  recipients,
  setRecipients,
  setSearch,
}: RecipientStepProps) => {
  const {
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,

    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
    },
    usePagination
  );
  React.useEffect(() => {
    if (sent) return;
    const recipients = page.map((row: Row<object>) => {
      const recipient = row.original as Recipient;
      recipient.selected = true;
      return recipient;
    }) as unknown as Recipient[];
    setRecipients(recipients);
  }, [data, page, sent, setRecipients]);

  return (
    <Box>
      {!sent && (
        <Flex gap={4}>
          <FormControl>
            <InputGroup>
              <Input
                type="text"
                placeholder="Ajouter un destinataire"
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputRightAddon>
                <MdSearch />
              </InputRightAddon>
            </InputGroup>
          </FormControl>
          <Stat>
            <Flex gap={2} textAlign={"center"}>
              <StatNumber>
                {recipients?.filter((recipient) => recipient.selected).length}
              </StatNumber>
              <StatHelpText>destinataires sélectionnés</StatHelpText>
            </Flex>
          </Stat>
        </Flex>
      )}
      <br />
      <Box border="1px" borderColor="#EDF2F7" py={4} borderRadius="0.375rem">
        <TableContainer>
          <Table size="sm" variant="striped">
            <Thead>
              {headerGroups.map((headerGroup: HeaderGroup) => {
                const { key, ...headerGroupProps } =
                  headerGroup.getHeaderGroupProps();
                return (
                  <Tr key={key} {...headerGroupProps}>
                    {headerGroup.headers.map((column: HeaderGroup) => {
                      const { key, ...columnProps } = column.getHeaderProps();
                      return (
                        <Th key={key} pb={4} {...columnProps}>
                          {column.render("Header")}
                        </Th>
                      );
                    })}
                  </Tr>
                );
              })}
            </Thead>

            <Tbody {...getTableBodyProps()}>
              {page &&
                page.length > 0 &&
                page.map((row: Row<object>) => {
                  prepareRow(row);
                  const { key, ...rowProps } = row.getRowProps();
                  return (
                    <Tr key={key} {...rowProps}>
                      {row.cells.map((cell: Cell) => {
                        const { key, ...cellProps } = cell.getCellProps();
                        const recipient = row.original as Recipient;
                        if (cell.column.id === "selected") {
                          if (sent) {
                            return (
                              <Td key={key} {...cellProps}>
                                <Box color="green.500" height={6} width={6}>
                                  <Icon as={RxPaperPlane} h={6} w={6} />
                                </Box>
                              </Td>
                            );
                          }
                          return (
                            <Td key={key} {...cellProps}>
                              <Switch
                                {...cellProps}
                                isChecked={recipient.selected === true}
                                defaultChecked={true}
                                onChange={() => {
                                  recipient.selected = !recipient.selected;
                                  setRecipients([...recipients]);
                                }}
                              />
                            </Td>
                          );
                        }
                        return (
                          <Td key={key} {...cellProps}>
                            {cell.render("Cell")}
                          </Td>
                        );
                      })}
                    </Tr>
                  );
                })}
            </Tbody>
          </Table>
          {!page || page.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              w="100%"
              h="52"
              textAlign="center"
            >
              <Text>
                Aucun destinataire trouvé,
                <br />
                veuillez importer ou ajouter des clients
              </Text>
            </Box>
          ) : null}
        </TableContainer>

        <Flex justifyContent="space-between" mt={4} mx={4} alignItems="center">
          <Flex>
            <Tooltip label="Première page">
              <IconButton
                size="sm"
                aria-label="Première page"
                onClick={() => gotoPage(0)}
                isDisabled={!canPreviousPage}
                icon={<ArrowLeftIcon h={3} w={3} />}
                mr={4}
              />
            </Tooltip>
            <Tooltip label="Page précédente">
              <IconButton
                size="sm"
                aria-label="Page précédente"
                onClick={previousPage}
                isDisabled={!canPreviousPage}
                icon={<ChevronLeftIcon h={6} w={6} />}
              />
            </Tooltip>
          </Flex>

          <Flex alignItems="center">
            <Text flexShrink="0" mr={8}>
              Page{" "}
              <Text fontWeight="bold" as="span">
                {pageIndex + 1 ?? 1}
              </Text>{" "}
              /{" "}
              <Text fontWeight="bold" as="span">
                {pageOptions?.length ?? 1}
              </Text>
            </Text>
            <Select
              size="sm"
              w={32}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Afficher {pageSize}
                </option>
              ))}
            </Select>
          </Flex>

          <Flex>
            <Tooltip label="Page suivante">
              <IconButton
                size="sm"
                aria-label="Page suivante"
                onClick={nextPage}
                isDisabled={!canNextPage}
                icon={<ChevronRightIcon h={6} w={6} />}
              />
            </Tooltip>
            <Tooltip label="Dernière page">
              <IconButton
                size="sm"
                aria-label="Dernière page"
                onClick={() => gotoPage(pageCount - 1)}
                isDisabled={!canNextPage}
                icon={<ArrowRightIcon h={3} w={3} />}
                ml={4}
              />
            </Tooltip>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default RecipientStep;
