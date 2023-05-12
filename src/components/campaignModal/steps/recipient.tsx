import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tfoot,
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
} from "@chakra-ui/react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@chakra-ui/icons";
import { useTable, usePagination } from "react-table";
import { MdSearch } from "react-icons/md";

interface RecipientStepProps {
  columns: any;
  data: any;
  isFetching: boolean;
}

export const RecipientStep = ({
  columns,
  data,
  isFetching,
}: RecipientStepProps) => {
  const {
    getTableProps,
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
      initialState: { pageIndex: 0 },
    },
    usePagination
  );

  return (
    <Box>
      <FormControl>
        <InputGroup>
          <Input type="text" placeholder="Ajouter un destinataire" />
          <InputRightAddon children={<MdSearch />} />
        </InputGroup>
      </FormControl>
      <br />
      <Box border="1px" borderColor="#EDF2F7" py={4} borderRadius="0.375rem">
        <TableContainer>
          <Table size="sm" variant="striped">
            <Thead>
              {headerGroups.map((headerGroup: any) => (
                <Tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column: any, index: number) => (
                    <Th pb={4} {...column.getHeaderProps()}>
                      {column.render("Header")}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>

            <Tbody {...getTableBodyProps()}>
              {page.map((row: any) => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()}>
                    {
                      row.cells.map((cell: any) => (
                        <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>
                      ))
                    }
                  </Tr>
                );
              })}
            </Tbody>

            {data && data.length > 20 ? (
              <Tfoot>
                <Tr>
                  <Th>Prénom</Th>
                  <Th>Nom</Th>
                  <Th>E-mail</Th>
                </Tr>
              </Tfoot>
            ) : null}
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
                {pageIndex + 1}
              </Text>{" "}
              /{" "}
              <Text fontWeight="bold" as="span">
                {pageOptions.length}
              </Text>
            </Text>
            <Text flexShrink="0">Aller à la page</Text>{" "}
            <NumberInput
              size="sm"
              ml={2}
              mr={8}
              w={28}
              min={1}
              max={pageOptions.length || 1}
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
