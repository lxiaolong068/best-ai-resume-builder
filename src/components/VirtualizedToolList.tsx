'use client'

import React, { memo, useCallback, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
// @ts-ignore
import InfiniteLoader from 'react-window-infinite-loader'

interface Tool {
  id: string
  name: string
  description: string | null
  websiteUrl: string | null
  pricingModel: string | null
  rating: number | null
  logoUrl: string | null
  affiliateLink: string | null
  features: any | null
}

interface VirtualizedToolListProps {
  tools: Tool[]
  hasNextPage: boolean
  isNextPageLoading: boolean
  loadNextPage: () => Promise<void>
  onToolClick?: (tool: Tool) => void
  onCompareToggle?: (toolId: string) => void
  selectedForComparison?: string[]
  itemHeight?: number
  height?: number
}

// Memoized tool item component for better performance
const ToolItem = memo<{
  index: number
  style: React.CSSProperties
  data: {
    tools: Tool[]
    onToolClick?: (tool: Tool) => void
    onCompareToggle?: (toolId: string) => void
    selectedForComparison?: string[]
  }
}>(({ index, style, data }) => {
  const { tools, onToolClick, onCompareToggle, selectedForComparison = [] } = data
  const tool = tools[index]

  if (!tool) {
    // Loading placeholder
    return (
      <div style={style} className="p-4 border-b border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isSelected = selectedForComparison.includes(tool.id)
  const canSelect = selectedForComparison.length < 5 || isSelected

  return (
    <div
      style={style}
      className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Tool Logo */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={`${tool.name} logo`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-bold">
                {tool.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Tool Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {tool.name}
              </h3>
              {tool.rating && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600">{tool.rating}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {tool.description || 'No description available'}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {tool.pricingModel || 'Not specified'}
              </span>
              {tool.features?.atsOptimized && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ATS Optimized
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onToolClick?.(tool)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
          >
            View Details
          </button>
          
          {onCompareToggle && (
            <button
              onClick={() => onCompareToggle(tool.id)}
              disabled={!canSelect}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : canSelect
                  ? 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                  : 'border border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSelected ? 'Remove' : 'Compare'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

ToolItem.displayName = 'ToolItem'

export const VirtualizedToolList: React.FC<VirtualizedToolListProps> = ({
  tools,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  onToolClick,
  onCompareToggle,
  selectedForComparison = [],
  itemHeight = 120,
  height = 600,
}) => {
  // Calculate total item count including loading items
  const itemCount = hasNextPage ? tools.length + 1 : tools.length
  
  // Check if item is loaded
  const isItemLoaded = useCallback(
    (index: number) => !!tools[index],
    [tools]
  )

  // Memoized item data to prevent unnecessary re-renders
  const itemData = useMemo(
    () => ({
      tools,
      onToolClick,
      onCompareToggle,
      selectedForComparison,
    }),
    [tools, onToolClick, onCompareToggle, selectedForComparison]
  )

  return (
    <div className="w-full">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={isNextPageLoading ? () => {} : loadNextPage}
      >
        {({ onItemsRendered, ref }: any) => (
          <List
            ref={ref}
            height={height}
            width="100%"
            itemCount={itemCount}
            itemSize={itemHeight}
            itemData={itemData}
            onItemsRendered={onItemsRendered}
            className="border border-gray-200 rounded-lg"
            overscanCount={5} // Render 5 extra items for smoother scrolling
          >
            {ToolItem}
          </List>
        )}
      </InfiniteLoader>
    </div>
  )
}

export default VirtualizedToolList
