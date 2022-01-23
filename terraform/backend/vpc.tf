data "aws_availability_zones" "available" {}

locals {
  vpc_cidr =                "10.0.0.0/16"
  public_subnet_1_cidr =    "10.0.1.0/24"
  public_subnet_2_cidr =    "10.0.2.0/24"
  private_subnet_1_cidr =   "10.0.100.0/24"
  private_subnet_2_cidr =   "10.0.101.0/24"
  cache_subnet_1_cidr =     "10.0.150.0/24"
  cache_subnet_2_cidr =     "10.0.151.0/24"
  codebuild_subnet_1_cidr = "10.0.200.0/24"
  codebuild_subnet_2_cidr = "10.0.201.0/24"
}

resource "aws_vpc" "main_vpc" {
  cidr_block = local.vpc_cidr

  tags = {
    Name = "Oakwood VPC - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "public_subnet_1" {
  cidr_block = local.public_subnet_1_cidr
  vpc_id = aws_vpc.main_vpc.id
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "Oakwood public subnet 1 - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "public_subnet_2" {
  cidr_block = local.public_subnet_2_cidr
  vpc_id = aws_vpc.main_vpc.id
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "Oakwood public subnet 2 - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "private_subnet_1" {
  cidr_block = local.private_subnet_1_cidr
  vpc_id = aws_vpc.main_vpc.id
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "Oakwood private subnet 1 - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "private_subnet_2" {
  cidr_block = local.private_subnet_2_cidr
  vpc_id = aws_vpc.main_vpc.id
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "Oakwood private subnet 2 - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "codebuild_subnet_1" {
  cidr_block = local.codebuild_subnet_1_cidr
  vpc_id = aws_vpc.main_vpc.id
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "Oakwood codebuild subnet 1 - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "codebuild_subnet_2" {
  cidr_block = local.codebuild_subnet_2_cidr
  vpc_id = aws_vpc.main_vpc.id
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "Oakwood codebuild subnet 2 - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "cache_subnet_1" {
  cidr_block = local.cache_subnet_1_cidr
  vpc_id = aws_vpc.main_vpc.id
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "Oakwood cache subnet 1 - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "cache_subnet_2" {
  cidr_block = local.cache_subnet_2_cidr
  vpc_id = aws_vpc.main_vpc.id
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "Oakwood cache subnet 2 - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_security_group" "codebuild_security_group" {
  vpc_id = aws_vpc.main_vpc.id
  name = "oakwood-codebuild-sg-${terraform.workspace}"

  egress {
    from_port = 0
    to_port = 0
    protocol = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_subnet_group" "oakwood_cache_subnet_group" {
  name = "oakwood-cache-subnets-${terraform.workspace}"
  subnet_ids = [aws_subnet.cache_subnet_1.id, aws_subnet.cache_subnet_2.id]
  description = "Oakwood ElastiCache subnets - ${terraform.workspace}"
}

// resource "aws_route_table" "public_route_table" {
//   vpc_id = aws_vpc.main_vpc.id
//
//   tags = {
//     Name = "Public routes - ${terraform.workspace}"
//     Environment = terraform.workspace
//   }
// }
//
// resource "aws_route_table" "private_route_table" {
//   vpc_id = aws_vpc.main_vpc.id
//
//   tags = {
//     Name = "Private routes - ${terraform.workspace}"
//     Environment = terraform.workspace
//   }
// }

// resource "aws_route_table_association" "public_route_1_association" {
//   subnet_id = aws_subnet.public_subnet_1.id
//   route_table_id = aws_route_table.public_route_table.id
// }
//
// resource "aws_route_table_association" "public_route_2_association" {
//   subnet_id = aws_subnet.public_subnet_2.id
//   route_table_id = aws_route_table.public_route_table.id
// }
//
// resource "aws_route_table_association" "private_route_1_association" {
//   subnet_id = aws_subnet.private_subnet_1.id
//   route_table_id = aws_route_table.private_route_table.id
// }
//
// resource "aws_route_table_association" "private_route_2_association" {
//   subnet_id = aws_subnet.private_subnet_2.id
//   route_table_id = aws_route_table.private_route_table.id
// }

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "Oakwood internet gateway - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_route_table" "internet_routes" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = {
    Name = "Oakwood internet routes - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

// NOTE: may not need these next two since AppSync should be handlin all public requests
resource "aws_route_table_association" "allow_public_route_1_internet" {
  subnet_id = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.internet_routes.id
}

resource "aws_route_table_association" "allow_public_route_2_internet" {
  subnet_id = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.internet_routes.id
}

// NOTE: might not need a NAT gateway, just testing
resource "aws_eip" "nat_gateway_eip" {
  vpc = true
  associate_with_private_ip = "10.0.0.5"

  tags = {
    Name = "Oakwood NAT Gateway EIP - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  depends_on = [aws_eip.nat_gateway_eip, aws_subnet.public_subnet_1]

  allocation_id = aws_eip.nat_gateway_eip.id
  subnet_id = aws_subnet.public_subnet_1.id

  tags = {
    Name = "Oakwood NAT Gateway - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_default_route_table" "new_default_route_table" {
  default_route_table_id = aws_vpc.main_vpc.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }

  tags = {
    Name = "Oakwood default table - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}
