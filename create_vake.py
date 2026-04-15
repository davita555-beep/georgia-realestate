content = open('app/page.jsx', encoding='utf-8').read()

content = content.replace(
    '  {lang === "ka" ? "იჯარა" : "Rental"}\n            <button onClick={openForm}',
    '  {lang === "ka" ? "იჯარა" : "Rental"}\n</a>\n            <button onClick={openForm}'
)

with open('app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('done')