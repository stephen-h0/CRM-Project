from faker import Faker
import csv

#initialize Faker
fake = Faker()

#specify the output CSV file name
output_file = 'mock_customer.csv'

#Define the number of records to genrate
num_records = 1000

#Define the fields for your dataset
fieldnames = ['CustomerID', 'FirstName', 'LastName', 'Email', 'Phone',]

#open file and write data
with open(output_file, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader() #for witing header
    for i in range(num_records):
        writer.writerow({
            'CustomerID' : i + 1,
            'FirstName'  : fake.first_name(),
            'LastName'   : fake.last_name(),
            'Email'      : fake.email(),
            'Phone'      : fake.phone_number(),
        })


print(f"Mock data successfully written to {output_file}")