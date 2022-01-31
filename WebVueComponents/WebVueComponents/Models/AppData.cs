using Bogus;
using System.Collections.Generic;
using System.Linq;

namespace WebVueComponents.Models
{
    public static class AppData
    {
        private static List<State> _states = new List<State>
        {
            new State
            {
                Id = 1,
                CountryId = 1,
                Name = "Badakhshan"
            },
            new State
            {
                Id = 2,
                CountryId = 1,
                Name = "Takhar"
            },
            new State
            {
                Id = 3,
                CountryId = 1,
                Name = "Panjshir"
            },
            new State
            {
                Id = 4,
                CountryId = 1,
                Name = "Khost"
            },
            new State
            {
                Id = 5,
                CountryId = 2,
                Name = "Gjirokastër"
            },
            new State
            {
                Id = 6,
                CountryId = 2,
                Name = "Dukagjini"
            },
            new State
            {
                Id = 7,
                CountryId = 2,
                Name = "Kastrioti"
            },
            new State
            {
                Id = 8,
                CountryId = 3,
                Name = "Adrar"
            },
            new State
            {
                Id = 9,
                CountryId = 3,
                Name = "Chlef"
            },
            new State
            {
                Id = 10,
                CountryId = 3,
                Name = "Laghouat"
            },
            new State
            {
                Id = 11,
                CountryId = 3,
                Name = "Tamanrasset"
            },
            new State
            {
                Id = 12,
                CountryId = 4,
                Name = "Prats"
            },
            new State
            {
                Id = 13,
                CountryId = 4,
                Name = "Les Bons"
            },
            new State
            {
                Id = 14,
                CountryId = 4,
                Name = "Aixirivall"
            },
            new State
            {
                Id = 15,
                CountryId = 4,
                Name = "Molleres"
            }
        };

        public static IEnumerable<Country> GetCountries()
        {
            return new List<Country>
            {
                new Country
                {
                    Id = 1,
                    Name = "Afghanistan"
                },
                new Country
                {
                    Id = 2,
                    Name = "Albania"
                },
                new Country
                {
                    Id = 3,
                    Name = "Algeria"
                },
                new Country
                {
                    Id = 4,
                    Name = "Andorra"
                }
            };
        }

        public static IEnumerable<State> GetStates(int countryId)
        {
            return _states.Where(q => q.CountryId == countryId).OrderBy(q => q.Name);
        }

        public static IEnumerable<DemoGrid> GetDemoGridData(int records = 0) 
        {
            var data = new List<DemoGrid>();

            var noOfRecords = records != 0 ? records : 10;

            int id = 0;
            
            var faker = new Faker<DemoGrid>().CustomInstantiator(f => new DemoGrid { Id = ++id })
                .RuleFor(r => r.First, f => f.Name.FirstName())
                .RuleFor(r => r.Last, f => f.Name.LastName())
                .RuleFor(r => r.Handle, f => f.Lorem.Letter(5));
            
            for (int i = 0; i < records; i++)
            {
                data.Add(faker.Generate());
            }

            return data;
        }

        public static IEnumerable<AddressBook> GetAddressBook(int records = 0)
        {
            var data = new List<AddressBook>();

            var noOfRecords = records != 0 ? records : 10; 

            var faker = new Faker<AddressBook>()
                .RuleFor(r => r.Title, f => f.Company.CompanyName())
                .RuleFor(r => r.SubTitle, f => { var bs = f.Company.Bs(); return bs.ToUpperInvariant(); })
                .RuleFor(r => r.Content, f => { return $"<h6 class='text-uppercase'>{f.Company.Bs()}</h6><p class='text-justify'>{f.Lorem.Paragraphs()}</p>"; })
                .RuleFor(r => r.Information3, f => f.Person.Website)
                .RuleFor(r => r.Information2, f => f.Person.Phone)
                .RuleFor(r => r.Information1, f => { return $"{f.Address.FullAddress()} {f.Address.OrdinalDirection()} {f.Address.City()} {f.Address.Country()} {f.Address.ZipCode()}"; });

            for (int i = 0; i < records; i++)
            {
                data.Add(faker.Generate());
            }

            return data;
        } 
    }

    public class Country
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class State
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CountryId { get; set; }
    }

    public class DemoGrid
    {
        public int Id { get; set; }
        public string First { get; set; }
        public string Last { get; set; }
        public string Handle { get; set; }
    }

    public class GridParams
    {
        public int Length { get; set; }
        public string SortDir { get; set; }
        public string Name { get; set; }
        public int Page { get; set; }
        public string Search { get; set; }
    }

    public class AddressBook
    {
        public string Title { get; set; }
        public string SubTitle { get; set; }
        public string Content { get; set; }
        public string Information1 { get; set; }
        public string Information2 { get; set; }
        public string Information3 { get; set; }
    }
}
