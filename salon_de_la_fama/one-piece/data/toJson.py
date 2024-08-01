import csv
import json
import pandas as pd
# Lista de nodos proporcionada
nodos = ['Beasts Pirates', 'Mokomo Dukedom', 'Straw Hat Grand Fleet', 'Red Hair Pirates', 'Whitebeard Pirates', 'Straw Hat Pirates',
         'Beasts Pirates (Numbers)', 'Roger Pirates', 'Ninja-Pirate-Mink-Samurai Alliance', 'Marines', 'Kid Pirates', 'Spade Pirates',
         'Thriller Bark Pirates', 'Blackbeard Pirates', 'Donquixote Pirates', 'Revolutionary Army', 'Kozuki Family', 'Big Mom Pirates', 'Sun Pirates (former)',
         'Kuja', 'Rocks Pirates (former)', 'CP0', 'World Government', 'Baroque Works']

# df = pd.read_csv('onepiece.csv', encoding='utf-8')

# organizaciones_distintas = []

# for row in df['Affiliations']:

#     if isinstance(row, str):

#         affiliations = row.split(';')

#         for affiliation in affiliations:

#             affiliation = affiliation.strip()

#             if affiliation and affiliation not in organizaciones_distintas:

#                 organizaciones_distintas.append(affiliation)

# # Imprimir la lista de organizaciones distintas
# # print(len(organizaciones_distintas))
# # print(organizaciones_distintas)

# afiliaciones_count = {}


# for row in df['Affiliations']:

#     if isinstance(row, str):

#         affiliations = row.split(';')

#         for affiliation in affiliations:

#             affiliation = affiliation.strip()

#             if affiliation:

#                 afiliaciones_count[affiliation] = afiliaciones_count.get(
#                     affiliation, 0) + 1


# # Crear la estructura del JSON
# data = {
#     "nodes": [{"id": nodo, 'count': afiliaciones_count[nodo]} for nodo in nodos],
#     "links": []
# }

# # Leer el archivo CSV y agregar los enlaces al JSON
# with open('relations.csv', newline='', encoding='utf-8') as csvfile:
#     reader = csv.DictReader(csvfile)
#     for row in reader:
#         print(row)
#         if row['value'] != '4':
#             data["links"].append({
#                 "source": row["source"],
#                 "target": row["target"],
#                 "value": int(row["value"])
#             })

# # Guardar el JSON en un archivo
# with open('relations.json', 'w', encoding='utf-8') as jsonfile:
#     json.dump(data, jsonfile, ensure_ascii=False, indent=4)

# print("JSON creado con éxito")

def extract_episode_number(debut):
    if pd.isna(debut):
        return None
    parts = debut.split(';')
    for part in parts:
        if 'Episode' in part:
            try:
                return int(part.strip().split(' ')[1])
            except ValueError:
                return None
    return None


def transform_onepiece_csv_to_json(input_csv_path, output_json_path):
    # Cargar el archivo CSV
    onepiece_df = pd.read_csv(input_csv_path, encoding='utf-8')

    # Filtrar las columnas necesarias
    onepiece_filtered = onepiece_df[[
        'Romanized Name', 'Debut', 'Affiliations']].copy()

    # Procesar la columna 'Debut' para extraer el número de episodio
    onepiece_filtered.loc[:, 'Debut'] = onepiece_filtered['Debut'].apply(
        extract_episode_number)

    # Convertir el DataFrame a una lista de diccionarios
    onepiece_list = onepiece_filtered.to_dict(orient='records')

    # Convertir la lista de diccionarios a un diccionario con la estructura deseada
    onepiece_dict = [
        {
            'nombre': record['Romanized Name'],
            'debut': record['Debut'],
            'pertenece': [affiliation.strip() for affiliation in record['Affiliations'].split(';')] if not pd.isna(record['Affiliations']) else []
        }
        for record in onepiece_list
    ]

    # Guardar el resultado en un archivo JSON
    with open(output_json_path, 'w', encoding='utf-8') as json_file:
        json.dump(onepiece_dict, json_file, ensure_ascii=False, indent=4)


transform_onepiece_csv_to_json('onepiece.csv', 'personajes.json')
