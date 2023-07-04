/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from "react";
import { Table, Thead, Tbody, Tr, Th, Td, chakra, Tfoot, Button, Flex, Skeleton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  getSortedRowModel
} from "@tanstack/react-table";

export type DataTableProps<Data extends object> = {
  data: Data[] | undefined;
  columns: ColumnDef<Data, any>[];
  pagination: {
    pageSize: number;
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  };
  countTotal: number;
  isLoading: boolean;
};

export function DataTable<Data extends object>({
  data,
  columns,
  pagination,
  countTotal,
  isLoading
}: DataTableProps<Data>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const tableData = React.useMemo(
    () => (isLoading ? Array(pagination.pageSize).fill({}) : data) as Data[],
    [isLoading, data]
  );

  const tableColumns = React.useMemo(
    () =>
    isLoading
        ? columns.map((column) => ({
            ...column,
            cell: () => <Skeleton w="full" h={8} />,
          }))
        : columns,
    [isLoading, columns]
  );

  const table = useReactTable({
    columns: tableColumns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination
    },
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: Math.ceil(countTotal / pagination.pageSize),
  });

  return (
    <Table>
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
              const meta: any = header.column.columnDef.meta;
              return (
                <Th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  isNumeric={meta?.isNumeric}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}

                  <chakra.span pl="4">
                    {header.column.getIsSorted() ? (
                      header.column.getIsSorted() === "desc" ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                      ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                      )
                    ) : null}
                  </chakra.span>
                </Th>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
              const meta: any = cell.column.columnDef.meta;
              return (
                <Td key={cell.id} isNumeric={meta?.isNumeric}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
      <Tfoot>
        <Tr>
          <Th colSpan={columns.length}>
            <Flex gap={2} mt={2}>
              <Button
                ml="auto"
                onClick={() => pagination.setPageIndex(pagination.pageIndex - 1)}
                isDisabled={pagination.pageIndex === 0}
                size="sm"
                color="gray.600"
                variant="ghost"
                leftIcon={<ChevronLeftIcon />}
              >
                Précédent
              </Button>
              <Flex gap={2}>
                {[...Array(Math.ceil(countTotal / pagination.pageSize))].map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => pagination.setPageIndex(i)}
                    size="sm"
                    color={i === pagination.pageIndex ? "black" : "gray.600"}
                    fontWeight={i === pagination.pageIndex ? "bold" : "normal"}
                    variant={i === pagination.pageIndex ? "solid" : "ghost"}
                  >
                    {i + 1}
                  </Button>
                ))}
              </Flex>
              <Button
                onClick={() => pagination.setPageIndex(pagination.pageIndex + 1)}
                isDisabled={pagination.pageSize * (pagination.pageIndex + 1) >= countTotal}
                size="sm"
                color="gray.600"
                variant="ghost"
                rightIcon={<ChevronRightIcon />}
              >
                Suivant
              </Button>
            </Flex>
          </Th>
        </Tr>
      </Tfoot>
    </Table>
  );
}