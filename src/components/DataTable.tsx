/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from "react";
import { Table, Thead, Tbody, Tr, Th, Td, chakra, Tfoot, Button, Flex, Skeleton, IconButton } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
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

  const { pageSize, pageIndex, setPageIndex } = pagination;

  const numberOfPages = React.useMemo(() => (
    Math.ceil(countTotal / pageSize)
  ), [countTotal, pageSize]);

  const arrPagination: number[] = React.useMemo(() => {
    const paginationArray = [];
    const lowerBound = Math.max(pageIndex === numberOfPages - 1 ? pageIndex - 2 : pageIndex - 1, 0);
    const upperBound = Math.min(pageIndex === 0 ? 2 : pageIndex === numberOfPages - 1 ? pageIndex : pageIndex + 1, countTotal - 1);

    for (let i = lowerBound; i <= upperBound; i++) {
      paginationArray.push(i);
    }

    return paginationArray;
  }, [countTotal, pageIndex]);

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
            <Flex gap={2} mt={2} justifyContent="end" alignItems="center">
              <IconButton
                icon={<ArrowLeftIcon w={2} h={2} />}
                aria-label="Go to first page"
                onClick={() => setPageIndex(0)}
                isDisabled={pageIndex === 0}
                size="sm"
                color="gray.600"
                variant="ghost"
              />
              <IconButton
                icon={<ChevronLeftIcon w={5} h={5} />}
                aria-label="Go to last page"
                onClick={() => setPageIndex(pageIndex - 1)}
                isDisabled={pageIndex === 0}
                size="sm"
                color="gray.600"
                variant="ghost"
              />
              <Flex gap={1}>
                {arrPagination.map(i => (
                  <Button
                    key={i}
                    onClick={() => setPageIndex(i)}
                    size="sm"
                    color={i === pageIndex ? "black" : "gray.600"}
                    fontWeight={i === pageIndex ? "bold" : "normal"}
                    variant={i === pageIndex ? "solid" : "ghost"}
                  >
                    {i + 1}
                  </Button>
                ))}
              </Flex>
              <IconButton
                icon={<ChevronRightIcon w={5} h={5} />}
                aria-label="Go to next page"
                onClick={() => setPageIndex(pageIndex + 1)}
                isDisabled={pageSize * (pageIndex + 1) >= countTotal}
                size="sm"
                color="gray.600"
                variant="ghost"
              />
              <IconButton
                icon={<ArrowRightIcon w={2} h={2} />}
                aria-label="Go to last page"
                onClick={() => setPageIndex(numberOfPages - 1)}
                isDisabled={pageSize * (pageIndex + 1) >= countTotal}
                size="sm"
                color="gray.600"
                variant="ghost"
              />
            </Flex>
          </Th>
        </Tr>
      </Tfoot>
    </Table>
  );
}