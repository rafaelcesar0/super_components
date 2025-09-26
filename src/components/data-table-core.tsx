'use client'
import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  Search,
  Filter,
  CaseSensitive,
  Target,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

type RowRecord = Record<string, unknown>

type ColumnMeta = {
  align?: 'left' | 'right'
  type?: string
}

type SearchState = {
  query: string
  columns: string[]
  caseSensitive: boolean
  exactMatch: boolean
}

export type RowContextMenuConfig<Row extends RowRecord = RowRecord> = {
  enabled?: boolean
  onEdit?: (row: Row) => void
  onDelete?: (row: Row) => void
  onCreate?: () => void
}

export type DataTableCoreProps = {
  tableId: string
  data: RowRecord[]
  columns: ColumnDef<RowRecord, unknown>[]
  pageSizeOptions?: number[]
  initialPageSize?: number
  className?: string
  rowContextMenu?: RowContextMenuConfig
}

export function DataTableCore({
  tableId,
  data,
  columns,
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 10,
  className,
  rowContextMenu,
}: DataTableCoreProps) {
  const allColumnIds = React.useMemo(
    () => columns.map((col) => col.id as string),
    [columns]
  )

  const [searchState, setSearchState] = React.useState<SearchState>(() => ({
    query: '',
    columns: allColumnIds,
    caseSensitive: false,
    exactMatch: false,
  }))

  const handleSearchStateChange = React.useCallback(
    (updater: Updater<SearchState>) => {
      setSearchState((prev) =>
        typeof updater === 'function' ? updater(prev) : updater
      )
    },
    []
  )

  const {
    query,
    columns: searchColumns,
    caseSensitive,
    exactMatch,
  } = searchState
  const [pagination, setPagination] = React.useState<PaginationState>(() => {
    const saved =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(`${tableId}:pageSize`)
        : null
    return {
      pageIndex: 0,
      pageSize: saved ? Number(saved) : initialPageSize,
    }
  })

  const handlePaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      setPagination((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (typeof window !== 'undefined' && next.pageSize !== prev.pageSize) {
          window.localStorage.setItem(
            `${tableId}:pageSize`,
            String(next.pageSize)
          )
        }
        return next
      })
    },
    [tableId]
  )

  const pageSizeOptionsResolved = React.useMemo(() => {
    if (pageSizeOptions.includes(pagination.pageSize)) {
      return pageSizeOptions
    }
    return [...pageSizeOptions, pagination.pageSize].sort((a, b) => a - b)
  }, [pageSizeOptions, pagination.pageSize])

  const customGlobalFilterFn = React.useCallback(
    (row: any, _columnId: string, value: SearchState | string) => {
      const normalizedValue: SearchState =
        typeof value === 'string'
          ? {
              query: value,
              columns: allColumnIds,
              caseSensitive: false,
              exactMatch: false,
            }
          : value ?? {
              query: '',
              columns: allColumnIds,
              caseSensitive: false,
              exactMatch: false,
            }

      if (!normalizedValue.query) return true

      const {
        query: searchQuery,
        columns: targetColumns,
        caseSensitive: targetCaseSensitive,
        exactMatch: targetExactMatch,
      } = normalizedValue
      const searchValue = targetCaseSensitive
        ? searchQuery
        : searchQuery.toLowerCase()
      for (const currentColumnId of targetColumns) {
        const cellValue = row.getValue(currentColumnId)
        if (cellValue != null) {
          const stringValue = targetCaseSensitive
            ? String(cellValue)
            : String(cellValue).toLowerCase()

          if (targetExactMatch) {
            if (stringValue === searchValue) return true
          } else {
            if (stringValue.includes(searchValue)) return true
          }
        }
      }
      return false
    },
    [allColumnIds]
  )

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: searchState, pagination },
    onGlobalFilterChange: handleSearchStateChange,
    onPaginationChange: handlePaginationChange,
    globalFilterFn: customGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const visibleColumns = table.getAllLeafColumns()

  const rowMenu = React.useMemo<RowContextMenuConfig>(() => {
    return {
      enabled: rowContextMenu?.enabled ?? false,
      onEdit: rowContextMenu?.onEdit ?? (() => {}),
      onDelete: rowContextMenu?.onDelete ?? (() => {}),
      onCreate: rowContextMenu?.onCreate ?? (() => {}),
    }
  }, [rowContextMenu])

  const toggleAllColumns = () => {
    handleSearchStateChange((prev) => ({
      ...prev,
      columns: prev.columns.length === allColumnIds.length ? [] : allColumnIds,
    }))
  }

  const toggleColumn = (columnId: string) => {
    handleSearchStateChange((prev) => ({
      ...prev,
      columns: prev.columns.includes(columnId)
        ? prev.columns.filter((id) => id !== columnId)
        : [...prev.columns, columnId],
    }))
  }

  const PaginationControls = () => (
    <div className='flex items-center justify-between'>
      <div className='text-sm text-muted-foreground'>
        {table.getFilteredRowModel().rows.length} linhas
      </div>
      <div className='flex items-center gap-2'>
        <select
          className='border rounded px-2 py-1 bg-background'
          value={pagination.pageSize}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
        >
          {pageSizeOptionsResolved.map((option) => (
            <option key={option} value={option}>
              {option} / página
            </option>
          ))}
        </select>
        <Button
          variant='outline'
          size='icon'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )

  return (
    <div className={cn('w-full max-w-full', className)}>
      <div className='flex items-center gap-2 mb-3 flex-wrap'>
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Buscar...'
              value={query}
              onChange={(event) =>
                handleSearchStateChange((prev) => ({
                  ...prev,
                  query: event.target.value,
                }))
              }
              className='w-[300px] pl-8'
            />
          </div>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Filter className='h-4 w-4' />
                    {searchColumns.length !== allColumnIds.length && (
                      <Badge
                        variant='secondary'
                        className='ml-1 h-5 px-1.5 text-xs'
                      >
                        {searchColumns.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Filtrar busca por colunas</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align='start' className='w-56'>
              <DropdownMenuLabel>Buscar por colunas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={searchColumns.length === allColumnIds.length}
                onCheckedChange={toggleAllColumns}
                onSelect={(event) => event.preventDefault()}
                className='font-medium'
              >
                Todos
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={searchColumns.includes(column.id as string)}
                  onCheckedChange={() => toggleColumn(column.id as string)}
                  onSelect={(event) => event.preventDefault()}
                  className='capitalize'
                >
                  {String(column.header)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={caseSensitive}
                onPressedChange={(value) =>
                  handleSearchStateChange((prev) => ({
                    ...prev,
                    caseSensitive: value,
                  }))
                }
                aria-label='Case sensitive'
                size='sm'
              >
                <CaseSensitive className='h-4 w-4' />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Diferenciar maiúsculas e minúsculas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={exactMatch}
                onPressedChange={(value) =>
                  handleSearchStateChange((prev) => ({
                    ...prev,
                    exactMatch: value,
                  }))
                }
                aria-label='Exact match'
                size='sm'
              >
                <Target className='h-4 w-4' />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Buscar por correspondência exata</TooltipContent>
          </Tooltip>
        </div>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          {table.getFilteredRowModel().rows.length} linhas
        </div>
        <div className='flex items-center gap-2'>
          <select
            className='border rounded px-2 py-1 bg-background text-sm'
            value={pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {pageSizeOptionsResolved.map((option) => (
              <option key={option} value={option}>
                {option} / página
              </option>
            ))}
          </select>
          <Button
            variant='outline'
            size='icon'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
        <div className='ml-auto flex items-center gap-2'>
          {rowMenu.enabled ? (
            <Button onClick={rowMenu.onCreate}>
              <Plus className='mr-2 h-4 w-4' />
              Criar
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <SlidersHorizontal className='mr-2 h-4 w-4' />
                Exibição
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>Colunas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {visibleColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(event) => event.preventDefault()}
                  className='capitalize'
                >
                  {String(column.columnDef.header)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator className='mb-3' />

      <div className='w-full overflow-x-auto overflow-y-visible border rounded-md'>
        <Table className='w-max min-w-full'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortState = header.column.getIsSorted()
                  const ariaSort =
                    sortState === 'asc'
                      ? 'ascending'
                      : sortState === 'desc'
                      ? 'descending'
                      : 'none'

                  const meta = header.column.columnDef.meta as
                    | ColumnMeta
                    | undefined
                  const headerAlign =
                    meta?.type === 'number' ? 'text-right' : 'text-left'

                  return (
                    <TableHead
                      key={header.id}
                      className={`whitespace-nowrap cursor-pointer select-none min-w-[120px] px-4 ${headerAlign}`}
                      onClick={header.column.getToggleSortingHandler()}
                      aria-sort={ariaSort}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {sortState === 'asc' && ' ▲'}
                      {sortState === 'desc' && ' ▼'}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const renderCells = () =>
                  row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | ColumnMeta
                      | undefined
                    return (
                      <TableCell
                        key={cell.id}
                        className={`whitespace-nowrap px-4 ${
                          meta?.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })

                if (!rowMenu.enabled) {
                  return <TableRow key={row.id}>{renderCells()}</TableRow>
                }

                const handleEdit = () =>
                  rowMenu.onEdit?.(row.original as RowRecord)
                const handleDelete = () =>
                  rowMenu.onDelete?.(row.original as RowRecord)

                return (
                  <ContextMenu key={row.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow>{renderCells()}</TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className='w-40'>
                      <ContextMenuItem onSelect={handleEdit}>
                        <Pencil className='h-4 w-4' />
                        Editar
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        variant='destructive'
                        onSelect={handleDelete}
                      >
                        <Trash2 className='h-4 w-4' />
                        Excluir
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className='h-24 text-center'
                >
                  Sem dados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='mt-3'>
        <PaginationControls />
      </div>
    </div>
  )
}
