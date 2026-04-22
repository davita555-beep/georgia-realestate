import { useState, useEffect } from 'react';

export default function SubdistrictPriceChart({ lang = 'en' }) {
  const [subdistrictData, setSubdistrictData] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = high to low, 'asc' = low to high
  const [filterGroup, setFilterGroup] = useState('all');
  const [updateDate, setUpdateDate] = useState(null);

  const t = {
    en: {
      title: "Live Subdistrict Prices",
      subtitle: "Updated weekly from ss.ge • More detailed than any competitor",
      sortBy: "Sort by price",
      highToLow: "High to Low", 
      lowToHigh: "Low to High",
      filterBy: "Filter by area",
      allAreas: "All Areas",
      perSqm: "per m²",
      listings: "listings",
      updated: "Updated",
      weekAgo: "week ago",
      loading: "Loading prices..."
    },
    ka: {
      title: "ლაივ ფასები რაიონების მიხედვით", 
      subtitle: "განახლება ყოველკვირა ss.ge-დან • ყველაზე დეტალური ბაზარზე",
      sortBy: "დალაგება ფასის მიხედვით",
      highToLow: "ძვირიდან იაფამდე",
      lowToHigh: "იაფიდან ძვირამდე", 
      filterBy: "ფილტრი უბნების მიხედვით",
      allAreas: "ყველა უბანი",
      perSqm: "კვ.მ-ზე",
      listings: "განცხადება",
      updated: "განახლდა",
      weekAgo: "კვირის წინ",
      loading: "იტვირთება..."
    }
  };

  const text = t[lang] || t.en;

  // District group mapping for colors and filtering
  const getDistrictGroup = (subdistrictName) => {
    const groupMap = {
      'ვაკე': 'vake_group',
      'ბაგები': 'vake_group', 
      'ლისის ტბა': 'vake_group',
      'საბურთალო': 'vake_group',
      'ვერა': 'center_group',
      'მთაწმინდა': 'center_group',
      'ელია': 'center_group',
      'დიდუბე': 'didube_group',
      'ლილო': 'isani_group'
    };
    return groupMap[subdistrictName] || 'other';
  };

  const getGroupColor = (group) => {
    const colors = {
      'vake_group': '#3B82F6',      // Blue - premium
      'center_group': '#8B5CF6',    // Purple - historic
      'didube_group': '#10B981',    // Green - developing  
      'isani_group': '#F59E0B',     // Orange - outer
      'other': '#6B7280'            // Gray - other
    };
    return colors[group] || colors.other;
  };

  const getGroupName = (group) => {
    const names = {
      en: {
        'vake_group': 'Vake Area',
        'center_group': 'City Center', 
        'didube_group': 'Didube Area',
        'isani_group': 'Outer Districts',
        'other': 'Other'
      },
      ka: {
        'vake_group': 'ვაკის რაიონი',
        'center_group': 'ცენტრი',
        'didube_group': 'დიდუბის რაიონი', 
        'isani_group': 'გარე უბნები',
        'other': 'სხვა'
      }
    };
    return names[lang]?.[group] || names.en[group] || group;
  };

  useEffect(() => {
    async function fetchSubdistrictData() {
      try {
        const response = await fetch('/data/prices.json');
        const data = await response.json();
        
        // Transform data for chart
        const chartData = Object.entries(data)
          .map(([key, value]) => ({
            name: value.name_ka || key,
            price: value.price_per_sqm || 0,
            sampleSize: value.sample_size || 0,
            updated: value.updated,
            newBuildPrice: value.price_per_sqm_new_build,
            resalePrice: value.price_per_sqm_resale,
            group: getDistrictGroup(value.name_ka || key)
          }))
          .filter(item => item.price > 0 && item.sampleSize >= 5); // Only show districts with enough data

        // Get most recent update date
        const dates = chartData.map(d => d.updated).filter(Boolean).sort().reverse();
        if (dates.length > 0) {
          const date = new Date(dates[0]);
          const formatted = date.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
            month: 'long',
            day: 'numeric'
          });
          setUpdateDate(formatted);
        }

        setSubdistrictData(chartData);
      } catch (error) {
        console.error('Error fetching subdistrict data:', error);
      }
    }

    fetchSubdistrictData();
  }, [lang]);

  // Sort and filter data
  const processedData = subdistrictData
    .filter(item => filterGroup === 'all' || item.group === filterGroup)
    .sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);

  const maxPrice = Math.max(...subdistrictData.map(d => d.price));
  const uniqueGroups = [...new Set(subdistrictData.map(d => d.group))];

  if (subdistrictData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">{text.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{text.title}</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {text.updated} {updateDate}
          </div>
        </div>
        <p className="text-gray-600">{text.subtitle}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Sort control */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{text.sortBy}:</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">{text.highToLow}</option>
            <option value="asc">{text.lowToHigh}</option>
          </select>
        </div>

        {/* Filter control */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{text.filterBy}:</label>
          <select 
            value={filterGroup} 
            onChange={(e) => setFilterGroup(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{text.allAreas}</option>
            {uniqueGroups.map(group => (
              <option key={group} value={group}>
                {getGroupName(group)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {processedData.map((item, index) => {
          const barWidth = (item.price / maxPrice) * 100;
          const color = getGroupColor(item.group);
          
          return (
            <div 
              key={item.name}
              className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              {/* Background bar */}
              <div 
                className="absolute left-0 top-0 h-full rounded-lg opacity-10"
                style={{ 
                  width: `${barWidth}%`, 
                  backgroundColor: color 
                }}
              ></div>
              
              {/* Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Color indicator */}
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  
                  {/* District name */}
                  <div className="font-medium text-gray-900">
                    {item.name}
                  </div>
                  
                  {/* Sample size */}
                  <div className="text-sm text-gray-500">
                    ({item.sampleSize} {text.listings})
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    ${item.price.toLocaleString()} <span className="text-sm font-normal text-gray-600">{text.perSqm}</span>
                  </div>
                  
                  {/* New vs Resale breakdown */}
                  {item.newBuildPrice && item.resalePrice && (
                    <div className="text-xs text-gray-500 mt-1">
                      {lang === 'ka' ? 'ახალი' : 'New'}: ${Math.round(item.newBuildPrice).toLocaleString()} • 
                      {lang === 'ka' ? 'მეორადი' : 'Resale'}: ${Math.round(item.resalePrice).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{processedData.length}</div>
            <div className="text-sm text-gray-600">{lang === 'ka' ? 'უბნები' : 'Subdistricts'}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(processedData.reduce((sum, d) => sum + d.price, 0) / processedData.length).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{lang === 'ka' ? 'საშუალო' : 'Average'}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              ${Math.max(...processedData.map(d => d.price)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{lang === 'ka' ? 'მაქსიმუმი' : 'Highest'}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {processedData.reduce((sum, d) => sum + d.sampleSize, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{lang === 'ka' ? 'განცხადებები' : 'Listings'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
