# %%
import pandas as pd

# define regions
REGIONS = ('Aleppo', 'Colombia', 'Iran', 'Karachi', 'Lebanon', 'Nairobi', 'Saudi Arabia', 'Thailand', 'Turkey', 'Venezuela', 'Yemen')
region_dfs = []
region_death_dfs = []

# read csv for each region
for region in REGIONS:

    region_df = pd.read_csv(r'../data/' + region + '.csv')
    region_df['REGION'] = region
    region_death_df = pd.read_csv(r'../data/' + region + '-deaths.csv')
    region_death_df['REGION'] = region
    region_dfs.append(region_df)
    region_death_dfs.append(region_death_df)

# combine dataframes
region_df = pd.concat(region_dfs, axis=0)
region_death_df = pd.concat(region_death_dfs, axis=0)

# merge death records with region data
# lookup_table = {
#     'abdominal pain' : 'abd pain',
#     'vomiting and diarrhea' : 'vomiting,diarrhea',
#     'vomiting & diarrhea' : 'vomiting,diarrhea',
#     'abdmnal pain oth spcf st' : 'abd pain oth spcf st',
#     'vomitingfever' : 'vomiting,fever',
#     'abd. pain' : 'abd pain',
#     'abdback pain' : 'abd pain,back pain',
#     'abdback pain' : 'abd pain,back pain',
#     'vomitting' : 'vomiting',
#     'abdmnal pain' : 'abd pain',
#     'abd.pain' : 'abd pain',
#     'abd pain vomiting' : 'abd pain,vomiting',
#     'vomitingheadache' : 'vomiting,headache',
#     'vomiting fever' : 'vomiting,fever',
#     'abd painabd pain' : 'abd pain',
#     'abd pain fever' : 'abd pain,fever',
#     'nose bleednose bleed' : 'nose bleed',
#     'vomitingabd pain' : 'vomiting,abd pain',
#     'abd painfever' : 'abd pain,fever',
#     'vomiting bloodvomiting blood' : 'vomiting blood',
#     'abd painvomiting' : 'abd pain,vomiting',
#     'abd and back pain' : 'abd pain,back pain',
#     'vomting' : 'vomiting',
#     'back pain strain' : 'back pain,back strain',
#     'back painstrain' : 'back pain,back strain',
#     'vomiting diarrhea' : 'vomiting,diarrhea',
#     ' vomiting diarrhea' : 'vomiting,diarrhea',
#     'vomiting and fever' : 'vomiting,fever',
#     'vomiting diarrhea' : 'vomiting,diarrhea',
#     'vomiting fever' : 'vomiting,fever',
#     ' vomiting fever' : 'vomiting,fever',
#     'abd pains' : 'abd pain',
#     'vomiting rash' : 'vomiting,rash',
#     'diarrhea and vomiting' : 'diarrhea,vomiting',
#     'vomiting blurred vision' : 'vomiting,blurred vision',
#     ' vomiting blurred vision' : 'vomiting,blurred vision',
#     'vomitingdiarrhea' : 'vomiting,diarrhea',
#     'back painback pain' : 'back pain',
#     'diarrhea fever' : 'diarrhea,fever',
#     'back and neck pain' : 'back pain,neck pain',
#     'back and leg pain' : 'back pain,leg pain',
#     'diarrhea vomiting' : 'diarrhea,vomiting',
#     'vomiting alone' : 'vomiting',
#     'abdmnal pain unspcf site' : 'abd pain unspcf site',
#     'vomiting diarrhea fever' : 'vomiting,diarrhea,fever',
#     'abdominal painabdominal pain' : 'abd pain',
#     'abdomen pain' : 'abd pain',
#     'back pn' : 'back pain',
#     'abd pn' : 'abd pain',
#     'abd px' : 'abd pain',
#     'back px' : 'back pain',
#     'vomiting abd pain' : 'vomiting,abd pain',
#     'abdominal pain vomiting' : 'abd pain,vomiting',
#     'nose bleeds' : 'nose bleed',
#     'vaginal bleedingvaginal bleeding' : 'vaginal bleeding',
#     'vag. bleeding' : 'vaginal bleeding',
#     'vag bleed' : 'vaginal bleeding',
#     'vag bleed preg' : 'vaginal bleeding,pregnant',
#     'vag bleeding' : 'vaginal bleeding',
#     'vag bleeding pregnant' : 'vaginal bleeding,pregnant',
#     'vag. bleed' : 'vaginal bleeding',
#     'pregnant bleeding' : 'vaginal bleeding,pregnant',
#     'back pains' : 'back pain',
#     'abd pain pregnant' : 'abd pain,pregnant',
#     'vaginal bleed' : 'vaginal bleeding',
#     'stomach hurts' : 'abd pain',
#     'back pains' : 'back pain',
#     'fever headache' : 'fever,headache',
#     'lip lac' : 'lip laceration',
#     'headache  blurred vision' : 'headache,blurred vision',
#     'nausea  vomiting' : 'nausea,vomiting',
#     'neck and back pain' : 'neck pain,back pain',
#     'ear pain fever' : 'ear pain,fever',
#     'fever  vomiting' : 'fever,vomiting',
#     'feverfever' : 'fever',
#     'fever cough' : 'fever,cough',
#     'neck painneck pain' : 'neck pain',
#     'cough and fever' : 'cough,fever',
#     'feverfever' : 'fever',
#     'abd pain vag bleeding' : 'vaginal bleeding,abd pain',
#     'headache   blurred vision' : 'headache,blurred vision',
#     'fever and vomiting' : 'fever,vomiting',
#     'coughcongestion' : 'cough,congestion',
#     'fever vomiting diarrhea' : 'fever,vomiting,diarrhea',
#     'heavy vaginal bleeding' : 'vaginal bleeding',
#     'fever and cough' : 'fever,cough',
#     'fevercough' : 'fever,cough',
#     'chronic back pain' : 'back pain',
#     'fever  rash' : 'fever,rash',
#     'fever fussy' : 'fever,fussy',
#     'feverrash' : 'fever,rash',
#     'fever neck pain' : 'fever,neck pain',
#     'vomiting  blurred vision' : 'vomiting,blurred vision',
#     'lower abdominal pain' : 'abd pain',
#     'blurred vision headache' : 'blurred vision,headache',
#     'vomiting  fever' : 'vomiting,fever',
#     'vomiting   diarrhea' : 'vomiting,diarrhea',
#     'vomiting  diarrhea ' : 'vomiting,diarrhea ',
#     'fever and vomiting' : 'fever,vomiting',
#     'vag bleeding preg' : 'vaginal bleeding,pregnant',
#     'vag bleedvag bleed' : 'vaginal bleeding'
# }

df = pd.merge(left=region_df, right=region_death_df, left_on=['REGION','PATIENT_ID'], right_on=['REGION', 'ID'], how='left')
df['SURVIVED'] = pd.isna(df['ID'])
df = df[['REGION', 'GENDER', 'PATIENT_ID', 'AGE', 'SYNDROME', 'SURVIVED']]
# df['SYNDROME'] = df['SYNDROME'].str.lower().replace(lookup_table).str.upper().str.split(',')
# df['SYNDROME'] = df['SYNDROME'].apply(lambda x: [a.strip() for a in x])

# aggregate regions by survivors and deaths
region_count_df = df.groupby(['REGION', 'SURVIVED']).size().reset_index().rename({0: 'COUNT'}, axis=1)

# write to file
region_count_df.to_csv(r'../output/region_count.csv', index=False)

# %%
# load Zoe's exploded data and merge with death records
syndrome_df = pd.read_csv(r'../data/exploded_syndrome.csv')
syndrome_df.drop('Unnamed: 0', axis=1, inplace=True)
syndrome_df.rename({'region': 'REGION'}, axis=1, inplace=True)
syndrome_merged_df = pd.merge(left=syndrome_df, right=region_death_df, left_on=['REGION','PATIENT_ID'], right_on=['REGION', 'ID'], how='left')
syndrome_merged_df['SURVIVED'] = pd.isna(syndrome_merged_df['ID'])
syndrome_merged_df['SYNDROME'] = syndrome_merged_df['SYNDROME'].str.upper()
syndrome_merged_df = syndrome_merged_df[['REGION', 'SYNDROME', 'SURVIVED']]

# get top n syndromes for each region
syndrome_grouped_df = syndrome_merged_df.groupby(['REGION', 'SYNDROME', 'SURVIVED']).size()
syndrome_region_dfs = []

for region in REGIONS:
    region_subset_df = syndrome_grouped_df.xs(region)
    syndromes = region_subset_df.groupby('SYNDROME').sum().nlargest(10).index
    syndrome_region_dfs.append(syndrome_grouped_df.loc[pd.IndexSlice[region, syndromes]].reset_index().rename({0: 'COUNT'}, axis=1))

# get top n syndromes overall (represents DEFAULT region)
default_region_subset_df = syndrome_merged_df.groupby(['SYNDROME', 'SURVIVED']).size()
syndromes = default_region_subset_df.groupby('SYNDROME').sum().nlargest(10).index
default_region_subset_df = default_region_subset_df.loc[pd.IndexSlice[syndromes]].reset_index().rename({0: 'COUNT'}, axis=1)
default_region_subset_df['REGION'] = 'DEFAULT'
syndrome_region_dfs.append(default_region_subset_df)

# write to file
pd.concat(syndrome_region_dfs, axis=0).to_csv(r'../output/region_syndromes.csv', index=False)