using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using WebVueComponents.Models;

namespace WebVueComponents.Apis
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private readonly IMemoryCache _memoryCache;

        public ValuesController(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        [Route("[action]"), HttpGet, ActionName("countries")]
        public IActionResult GetCountries()
        {
            return Ok(AppData.GetCountries());
        }

        [Route("[action]"), HttpPost, ActionName("states")]
        public IActionResult GetStates([FromForm] int id)
        {
            return Ok(AppData.GetStates(id));
        }

        [Route("[action]"), HttpGet, ActionName("griddata")]
        public IActionResult GetGridData([FromQuery] GridParams gridParams)
        {
            gridParams ??= new GridParams();

            var data = PopulateData();

            var total = data.Count();

            data = ApplyFilters(gridParams, data);

            total = !string.IsNullOrEmpty(gridParams.Search) ? data.Count() : total;

            return Ok(new { Total = total, Records = data });
        }

        [Route("[action]"), HttpGet, ActionName("addressbookdata")]
        public IActionResult GetAddressBook([FromQuery] GridParams gridParams)
        {
            gridParams ??= new GridParams();

            var data = PopulateAddressData();

            var total = data.Count();

            data = data.Skip((gridParams.Page - 1) * gridParams.Length).Take(gridParams.Length); 

            return Ok(new { Total = total, Records = data });
        }

        private IEnumerable<DemoGrid> ApplyFilters(GridParams gridParams, IEnumerable<DemoGrid> data)
        {
            if (!string.IsNullOrEmpty(gridParams.Search))
            {
                var comparison = StringComparison.InvariantCultureIgnoreCase;

                data = data.Where(q => q.First.Contains(gridParams.Search, comparison) ||
                q.Last.Contains(gridParams.Search, comparison) || q.Handle.Contains(gridParams.Search, comparison));
            }

            gridParams.Length = gridParams.Length == 0 ? data.Count() : gridParams.Length;

            if (!string.IsNullOrEmpty(gridParams.SortDir) && !string.IsNullOrEmpty(gridParams.Name))
            {
                var isAsc = gridParams.SortDir.Equals("asc", System.StringComparison.InvariantCultureIgnoreCase);

                var flags = BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase;

                data = isAsc ? data.OrderBy(q => q.GetType().GetProperty(gridParams.Name, flags).GetValue(q)) :
                    data.OrderByDescending(q => q.GetType().GetProperty(gridParams.Name, flags).GetValue(q));
            }

            return data.Skip((gridParams.Page - 1) * gridParams.Length).Take(gridParams.Length);
        }

        private IEnumerable<DemoGrid> PopulateData()
        {
            if (_memoryCache.TryGetValue("_gridData", out IEnumerable<DemoGrid> data))
                return data;

            data = AppData.GetDemoGridData(50);
            _memoryCache.Set("_gridData", data);
            return data;
        }

        private IEnumerable<AddressBook> PopulateAddressData()
        {
            if (_memoryCache.TryGetValue("_addressBookData", out IEnumerable<AddressBook> data))
                return data;

            data = AppData.GetAddressBook(30);
            _memoryCache.Set("_addressBookData", data);
            return data;
        }
    }
}
