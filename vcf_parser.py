def parse_vcf(file_content):
    variants = []
    lines = file_content.decode().split("\n")

    for line in lines:
        if line.startswith("#"):
            continue

        columns = line.split()

        if len(columns) > 2:
            variants.append({
                "rsid": columns[2]
            })

    return variants
