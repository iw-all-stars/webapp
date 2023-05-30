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
  CircularProgress,
  Flex,
  Tooltip,
  IconButton,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Stat,
  StatHelpText,
  StatNumber,
} from "@chakra-ui/react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@chakra-ui/icons";
import { type Campaign } from "@prisma/client";

interface RecipientStepProps {
  columns: Column<object>[];
  data: Partial<Campaign>[];
  isFetching: boolean;
}

export const RecipientStep = ({
  columns,
  data,
  isFetching,
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
  } = useTable({
    columns,
    data,
    // sortingFns: {
    //   date: (rowA: Row<object>, rowB: Row<object>, columnId: string) => {
    //     const a = rowA.original[columnId];
    //     const b = rowB.original[columnId];
    //     if (a === b) return 0;
    //     return a > b ? 1 : -1;
    //   },
    // },
    usePagination,
  });

  return (
    <Box>
      <Flex gap={4}>
        <FormControl>
          <InputGroup>
            <Input type="text" placeholder="Ajouter un destinataire" />
            <InputRightAddon>
              <MdSearch />
            </InputRightAddon>
          </InputGroup>
        </FormControl>
        <Stat>
          <Flex gap={2} textAlign={"center"}>
            <StatNumber>{data.length}</StatNumber>
            <StatHelpText>destinataires sélectionnés</StatHelpText>
          </Flex>
        </Stat>
      </Flex>
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
          {data && data.length === 0 ? (
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
          {isFetching ? (
            <Box mt={"4"} w={"full"} display={"flex"} justifyContent={"center"}>
              <CircularProgress isIndeterminate color="green.300" size={8} />
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
                {pageIndex ?? 0}
              </Text>{" "}
              /{" "}
              <Text fontWeight="bold" as="span">
                {pageOptions?.length ?? 0}
              </Text>
            </Text>
            <Text flexShrink="0">Aller à la page</Text>{" "}
            <NumberInput
              size="sm"
              ml={2}
              mr={8}
              w={28}
              min={1}
              max={pageOptions?.length || 0}
              onChange={(value) => {
                const page = Number(value) ? Number(value) - 1 : 0;
                gotoPage(page);
              }}
              defaultValue={pageIndex + 1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
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
