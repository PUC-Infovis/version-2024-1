import pandas as pd
import csv

df = pd.read_csv('onepiece.csv', encoding='utf-8')

organizaciones_distintas = []


for row in df['Affiliations']:

    if isinstance(row, str):

        affiliations = row.split(';')

        for affiliation in affiliations:

            affiliation = affiliation.strip()

            if affiliation and affiliation not in organizaciones_distintas:

                organizaciones_distintas.append(affiliation)

# Imprimir la lista de organizaciones distintas
# print(len(organizaciones_distintas))
print(organizaciones_distintas)

afiliaciones_count = {}


for row in df['Affiliations']:

    if isinstance(row, str):

        affiliations = row.split(';')

        for affiliation in affiliations:

            affiliation = affiliation.strip()

            if affiliation:

                afiliaciones_count[affiliation] = afiliaciones_count.get(
                    affiliation, 0) + 1


print(afiliaciones_count)
grupos_filtrados = [org for org,
                    count in afiliaciones_count.items() if count >= 10]


print(grupos_filtrados)
grupos_filtrados.remove('Shandia')
grupos_filtrados.remove('Baroque Works (former)')
grupos_filtrados.remove('Ninja-Pirate-Mink-Samurai Alliance (disbanded)')
grupos_filtrados.remove('CP9 (former)')
grupos_filtrados.remove('Levely')
grupos_filtrados.remove('Impel Down (former)')
grupos_filtrados.remove('Charlotte Family')
grupos_filtrados.remove('Tontatta Kingdom')
grupos_filtrados.remove('Ally of the Whitebeard Pirates')
grupos_filtrados.remove('Orochi Oniwabanshu (former)')
grupos_filtrados.remove('Foxy Pirates')
grupos_filtrados.remove('Impel Down')

print("-" * 100)
print(len(grupos_filtrados))
print(grupos_filtrados)
print(24 * 23 / 2)
registro_relaciones = []


# def existe_relacion(registro, org1, org2):
#     for row in registro:
#         if (row['Org1'] == org1 and row['Org2'] == org2) or (row['Org1'] == org2 and row['Org2'] == org1):
#             return True
#     return False


# # for i in range(len(grupos_filtrados)):
# #     for j in range(i + 1, len(grupos_filtrados)):
# #         org1 = grupos_filtrados[i]
# #         org2 = grupos_filtrados[j]
# #         if not existe_relacion(registro_relaciones, org1, org2):
# #             relacion = input(
# #                 f"Ingrese la relación entre {org1} y {org2} ([1: Aliado, 2: Neutral, 3: Enemigo, 4: none]): ")
# #             registro_relaciones.append(
# #                 {'Org1': org1, 'Org2': org2, 'Relacion': relacion})

# # with open('relations.csv', 'w', newline='') as csvfile:
# #     fieldnames = ['Org1', 'Org2', 'Relacion']
# #     writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
# #     writer.writeheader()
# #     for row in registro_relaciones:
# #         writer.writerow(row)

# arcs_df = pd.read_csv('arcs.csv', encoding='utf-8')
# canon_arcs_df = arcs_df[arcs_df['Arc Type'] == 'Canon']
# print(len(canon_arcs_df))

# registro_orgs_in_arc = []

# # Iterar sobre cada arco en arcs.csv
# for arc_name in canon_arcs_df['Arc Name']:
#     for grupo in grupos_filtrados:
#         # Solicitar al usuario ingresar si el grupo está presente en el arco
#         presencia = input(
#             f"{grupo} en {arc_name}:  ")
#         # Agregar la relación al registro
#         registro_orgs_in_arc.append(
#             {'Arc Name': arc_name, 'Organización': grupo, 'Presencia': presencia})

# # Guardar el registro de relaciones en un archivo CSV
# with open('orgs_in_arc.csv', 'w', newline='') as csvfile:
#     fieldnames = ['Arc Name', 'Organización', 'Presencia']
#     writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
#     writer.writeheader()
#     for row in registro_orgs_in_arc:
#         writer.writerow(row)

# lista_arcs = []

# arcs_df = pd.read_csv('complete_data_v01.csv', encoding='utf-8')
# canon_arcs_df = arcs_df[arcs_df['Type'] == 'Canon']


# print("¡Archivo orgs_in_arc.csv creado exitosamente!")
